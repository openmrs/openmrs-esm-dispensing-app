import { mutate } from "swr";
import {
  Coding,
  DosageInstruction,
  Medication,
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationReferenceOrCodeableConcept,
  MedicationRequest,
  MedicationRequestCombinedStatus,
  MedicationRequestFulfillerStatus,
  MedicationRequestStatus,
  Quantity,
} from "./types";
import { fhirBaseUrl, parseDate } from "@openmrs/esm-framework";
import {
  PRESCRIPTIONS_TABLE_ENDPOINT,
  OPENMRS_FHIR_EXT_DISPENSE_RECORDED,
  OPENMRS_FHIR_EXT_MEDICINE,
  OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
  PRESCRIPTION_DETAILS_ENDPOINT,
} from "./constants";
import dayjs from "dayjs";

/**
 * Within the UI, the "status" of a request we want to display to the pharmacist is
 * a combination of the status and the fulfiller statuts; given a request
 * this calculates the actual status we want to display to the pharmacist
 *
 * @param medicationRequests
 * @param medicationRequestExpirationPeriodInDays
 */
export function computeMedicationRequestCombinedStatus(
  medicationRequest: MedicationRequest,
  medicationRequestExpirationPeriondInDays: number
): MedicationRequestCombinedStatus {
  const medicationRequestStatus: MedicationRequestStatus =
    computeMedicationRequestStatus(
      medicationRequest,
      medicationRequestExpirationPeriondInDays
    );
  const medicationRequestFulfillerStatus: MedicationRequestFulfillerStatus =
    getFulfillerStatus(medicationRequest);

  // if the request is no longer active, that status takes precedent
  if (medicationRequestStatus !== MedicationRequestStatus.active) {
    if (medicationRequestStatus === MedicationRequestStatus.expired) {
      return MedicationRequestCombinedStatus.expired;
    } else if (medicationRequestStatus === MedicationRequestStatus.completed) {
      return MedicationRequestCombinedStatus.completed;
    } else if (medicationRequestStatus === MedicationRequestStatus.cancelled) {
      return MedicationRequestCombinedStatus.cancelled;
    }
  }
  // otherwise, if the medication dispense status is paused or closed, return that
  if (
    medicationRequestFulfillerStatus ===
    MedicationRequestFulfillerStatus.declined
  ) {
    return MedicationRequestCombinedStatus.declined;
  } else if (
    medicationRequestFulfillerStatus ===
    MedicationRequestFulfillerStatus.on_hold
  ) {
    return MedicationRequestCombinedStatus.on_hold;
  }

  // otherwise, return active
  return MedicationRequestCombinedStatus.active;
}

/**
 * Calculates the status of a medication request given the request and the expiration period in days
 * Necessary to handle the (admittedly confusing) fact that the Dispense ESMs idea of "expired" is different
 * from that of the OpenMRS Backend, see logic below
 *
 * @param medicationRequests
 * @param medicationRequestExpirationPeriodInDays
 */
export function computeMedicationRequestStatus(
  medicationRequest: MedicationRequest,
  medicationRequestExpirationPeriodInDays: number
): MedicationRequestStatus {
  if (
    medicationRequest.status === MedicationRequestStatus.cancelled ||
    medicationRequest.status === MedicationRequestStatus.completed
  ) {
    return medicationRequest.status;
  }

  // expired is not based on based actual medication request expired status, but calculated from our configurable expiration period in days
  // NOTE: the assumption here is that the validityPeriod.start is equal to encounter datetime of the associated encounter, because we use the encounter date when doing backend querying
  if (
    medicationRequest.dispenseRequest?.validityPeriod?.start &&
    dayjs(medicationRequest.dispenseRequest.validityPeriod.start).isBefore(
      dayjs()
        .startOf("day")
        .subtract(medicationRequestExpirationPeriodInDays, "day")
    )
  ) {
    return MedicationRequestStatus.expired;
  }

  return MedicationRequestStatus.active;
}

/**
 * Captures the logic to compute the new fulfiller status after a dispense event, where dispense event = a medication dispense where medication is actually dispensed (as opposed one with status "on_hold" or "declined")
 *
 * @param restrictTotalQuantityDispensed value of the "dispenseBehavior.restrictTotalQuantityDispensed"
 * @param isMostRecentMedicationDisepnse whether the dispense event we are creating or editing is the most recent dispense for this medication request
 * @param currentFulfillerStatus the current fulfiller status (prior to the changes being applied by the creation/edit of this dispense event)
 * @param quantityDispensed the quantity dispensed as part of this dispense event
 * @param quanatityRemaining the quantity remaining not including the amount in this dispense event
 */
export function computeNewFulfillerStatusAfterDispenseEvent(
  restrictTotalQuantityDispensed: boolean,
  isMostRecentMedicationDisepnse: boolean,
  currentFulfillerStatus: MedicationRequestFulfillerStatus,
  quantityDispensed: number,
  quantityRemaining: number
): MedicationRequestFulfillerStatus {
  const reachedMaxQuantity =
    quantityDispensed && quantityDispensed >= quantityRemaining;
  if (restrictTotalQuantityDispensed) {
    // if are configured to restrict amount dispense
    if (reachedMaxQuantity) {
      // if we've maxed out the quqntity, set complete, no matter what
      return MedicationRequestFulfillerStatus.completed;
    } else if (isMostRecentMedicationDisepnse) {
      // otherwise, if this is the most recent, set status to null (ie, clear out "on-hold" if currently set)
      return null;
    } else if (
      currentFulfillerStatus === MedicationRequestFulfillerStatus.completed
    ) {
      // handle the case where we are editing a previous entry and are decreasing the amount dispensed so the request is no longer "complete"
      return null;
    } else {
      // otherwise, no change
      return currentFulfillerStatus;
    }
  } else {
    // if we are not restricting the amount dispensed, we just need to make sure that any new dispense clears out any previous status
    if (isMostRecentMedicationDisepnse) {
      return null;
    } else {
      return currentFulfillerStatus;
    }
  }
}

/**
 * Captures the logic to compute the new fulfiller status after a medication dispense is deleted
 *
 * @param isMostRecentMedicationDisepnse whether the medication dispense we are deleting is the most recent dispense for this medication request
 * @param currentFulfillerStatus the current fulfiller status (prior to deleting this medication dispense)
 * @param deletedMedicationStatus the status of the medication dispense we are deleting
 * @param nextMostRecentDispenseStatus the status of 2nd most recent medication dispense (if any) associated with this medication request
 */
export function computeNewFulfillerStatusAfterDelete(
  isMostRecentDispense: boolean,
  currentFulfillerStatus: MedicationRequestFulfillerStatus,
  deletedMedicationStatus: MedicationDispenseStatus,
  nextMostRecentDispenseStatus: MedicationDispenseStatus
): MedicationRequestFulfillerStatus {
  // if this the most recent dispense event we are deleting, set the fulfiller status based on the next most recent
  if (isMostRecentDispense) {
    if (nextMostRecentDispenseStatus === MedicationDispenseStatus.declined) {
      return MedicationRequestFulfillerStatus.declined;
    } else if (
      nextMostRecentDispenseStatus === MedicationDispenseStatus.on_hold
    ) {
      return MedicationRequestFulfillerStatus.on_hold;
    }
    // note that next most recent should never be "completed' as complete is a terminal statue
    else {
      return null;
    }
  }
  // otherwise, if this is a "complete" dispense event, make sure the prescription is no loner marked as complete
  // (assumption that a deletion of any medication dispense of type "complete" will lower the quantity dispenses, so therefore must be under total allowed amount)
  else if (deletedMedicationStatus === MedicationDispenseStatus.completed) {
    return null;
  } else {
    // otherwise, no change
    return currentFulfillerStatus;
  }
}

/**
 * Given a set of medication requests, calculates the "combined" status (see computeMedicationRequestCombinedStatus)
 * of each, and then, from those determines the overall status of the "prescription" (where "prescription"
 * means all medication requests in a single encounter)
 * @param medicationRequests
 * @param medicationRequestExpirationPeriodInDays
 */
export function computePrescriptionStatus(
  medicationRequests: Array<MedicationRequest>,
  medicationRequestExpirationPeriodInDays: number
): MedicationRequestCombinedStatus {
  if (!medicationRequests || medicationRequests.length === 0) {
    return null;
  }

  const medicationRequestCombinedStatuses: Array<MedicationRequestCombinedStatus> =
    medicationRequests.map((medicationRequest) =>
      computeMedicationRequestCombinedStatus(
        medicationRequest,
        medicationRequestExpirationPeriodInDays
      )
    );

  if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.active
    )
  ) {
    return MedicationRequestCombinedStatus.active;
  } else if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.on_hold
    )
  ) {
    return MedicationRequestCombinedStatus.on_hold;
  } else if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.completed
    )
  ) {
    return MedicationRequestCombinedStatus.completed;
  } else if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.declined
    )
  ) {
    return MedicationRequestCombinedStatus.declined;
  } else if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.cancelled
    )
  ) {
    return MedicationRequestCombinedStatus.cancelled;
  } else if (
    medicationRequestCombinedStatuses.includes(
      MedicationRequestCombinedStatus.expired
    )
  ) {
    return MedicationRequestCombinedStatus.expired;
  }

  return null;
}

/**
 * Calculates the prescription status and then returns the actual message code we want to display to the end user
 *
 * @param medicationRequests
 * @param medicationRequestExpirationPeriodInDays
 */
export function computePrescriptionStatusMessageCode(
  medicationRequests: Array<MedicationRequest>,
  medicationRequestExpirationPeriodInDays: number
): string {
  const medicationRequestCombinedStatus: MedicationRequestCombinedStatus =
    computePrescriptionStatus(
      medicationRequests,
      medicationRequestExpirationPeriodInDays
    );

  if (medicationRequestCombinedStatus === null) {
    return null;
  } else if (
    medicationRequestCombinedStatus === MedicationRequestCombinedStatus.active
  ) {
    return "active";
  } else if (
    medicationRequestCombinedStatus === MedicationRequestCombinedStatus.on_hold
  ) {
    return "paused";
  } else if (
    medicationRequestCombinedStatus ===
    MedicationRequestCombinedStatus.completed
  ) {
    return "completed";
  } else if (
    medicationRequestCombinedStatus === MedicationRequestCombinedStatus.declined
  ) {
    return "closed";
  } else if (
    medicationRequestCombinedStatus === MedicationRequestCombinedStatus.expired
  ) {
    return "expired";
  } else if (
    medicationRequestCombinedStatus ===
    MedicationRequestCombinedStatus.cancelled
  ) {
    return "cancelled";
  }
  return null;
}

export function computeQuantityRemaining(
  medicationRequest: MedicationRequest,
  medicationDispenses: Array<MedicationDispense>
): number {
  if (medicationRequest) {
    // sanity check to make sure all medication dispenses are associated with the request
    const associatedMedicationDispenses = getAssociatedMedicationDispenses(
      medicationRequest,
      medicationDispenses
    );

    // hard protect against quantity type mistmatch
    if (
      !getQuantityUnitsMatch([
        medicationRequest,
        ...associatedMedicationDispenses,
      ])
    ) {
      throw new Error("Cannot calculate quantity remaining, units dont match");
    }

    return (
      computeTotalQuantityOrdered(medicationRequest) -
      computeTotalQuantityDispensed(associatedMedicationDispenses)
    );
  }
  return 0;
}

/**
 * Given a set of medication dispenses, calculate the total quantity dispensed
 * @param medicationDispenses
 */
export function computeTotalQuantityDispensed(
  medicationDispenses: Array<MedicationDispense>
): number {
  if (medicationDispenses) {
    if (!getQuantityUnitsMatch(medicationDispenses)) {
      throw new Error(
        "Can't calculate quantity dispensed if units don't match"
      );
    }
    const quantity = medicationDispenses
      .map((medicationDispense) =>
        medicationDispense.quantity?.value
          ? medicationDispense.quantity?.value
          : 0
      )
      .reduce((acc, currentValue) => acc + currentValue, 0);
    return quantity;
  } else {
    return 0;
  }
}

/**
 * Given a medication request, calculate the total quantity ordered (including all refills)
 * @param medicationRequest
 */
export function computeTotalQuantityOrdered(
  medicationRequest: MedicationRequest
): number {
  const refillsAllowed = getRefillsAllowed(medicationRequest);
  if (medicationRequest.dispenseRequest?.quantity?.value) {
    return (
      medicationRequest.dispenseRequest.quantity.value *
      (1 + (refillsAllowed ? refillsAllowed : 0))
    );
  } else {
    return null;
  }
}

/**
 * Given a medication request and an array of medication dispenses, fetch all dispenses authorized by that request
 *
 * @param medicationRequest
 * @param medicationDispenses
 */
export function getAssociatedMedicationDispenses(
  medicationRequest: MedicationRequest,
  medicationDispenses: Array<MedicationDispense>
): Array<MedicationDispense> {
  return medicationDispenses?.filter((medicationDispense) =>
    medicationDispense?.authorizingPrescription?.some((prescription) =>
      prescription.reference.endsWith(medicationRequest.id)
    )
  );
}

/**
 * Given a medication dispense and an array of medication requests, fetch request which authorized this request
 *
 * @param medicationDispense
 * @param medicationRequests
 */
export function getAssociatedMedicationRequest(
  medicationDispense: MedicationDispense,
  medicationRequests: Array<MedicationRequest>
): MedicationRequest {
  return medicationRequests.find((medicationRequest) =>
    medicationDispense?.authorizingPrescription?.some((prescription) =>
      prescription.reference.endsWith(medicationRequest.id)
    )
  );
}

/**
 * Given an array of CodeableConcept codings, return the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCoding(codings: Coding[]): Coding {
  return codings
    ? codings.find((c) => !("system" in c) || c.system === undefined)
    : null;
}

/**
 * Given an array of CodeableConcept codings, return the display for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingDisplay(codings: Coding[]): string {
  return getConceptCoding(codings)?.display;
}

/**
 * Given an array of CodeableConcept codings, return the code for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingUuid(codings: Coding[]): string {
  return getConceptCoding(codings)?.code;
}

/**
 * Fetch the "recorded" extension off a medication request
 * @param medicationDispense
 */
export function getDateRecorded(
  medicationDispense: MedicationDispense
): string {
  return medicationDispense?.extension?.find(
    (ext) => ext.url === OPENMRS_FHIR_EXT_DISPENSE_RECORDED
  )?.valueDateTime;
}

export function getDosageInstruction(
  dosageInstructions: Array<DosageInstruction>
): DosageInstruction {
  if (dosageInstructions?.length > 0) {
    return dosageInstructions[0];
  }
  return null;
}

/**
 * Fetch the "fulfiller status" extension off a medication request
 * @param medicationDispense
 */
export function getFulfillerStatus(
  medicationRequest: MedicationRequest
): MedicationRequestFulfillerStatus {
  return medicationRequest?.extension?.find(
    (ext) => ext.url === OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS
  )?.valueCode;
}

export function getMedicationsByConceptEndpoint(conceptUuid: string): string {
  return `${fhirBaseUrl}/Medication?code=${conceptUuid}`;
}

/**
 * Given a medication reference/codeable concept, format for display
 * When we have a medication reference (ie a coded Drug reference in the OpenMRS model) we simply use the display property associated with the medication reference
 * When we do not have medication reference, we display the associated concept and the OpenMRS DrugOrder.drugNonCoded string (which is stored in the codeable concept text field)
 *  (this may be slightly duplicative, but protects against the case when the provider only enters the formulation, not the drug, in the drugNonCoded field)
 * @param medication
 */
export function getMedicationDisplay(
  medication: MedicationReferenceOrCodeableConcept
): string {
  return medication.medicationReference
    ? medication.medicationReference.display
    : getConceptCodingDisplay(medication?.medicationCodeableConcept.coding) +
        ": " +
        medication?.medicationCodeableConcept.text;
}

// TODO does this need to null-check
export function getMedicationReferenceOrCodeableConcept(
  resource: MedicationRequest | MedicationDispense
): MedicationReferenceOrCodeableConcept {
  return {
    medicationReference: resource.medicationReference,
    medicationCodeableConcept: resource.medicationCodeableConcept,
  };
}

/**
 * Given a set of medication requests, return the status of the one with the most recent recorded date
 */
export function getMostRecentMedicationDispenseStatus(
  medicationDispenses: Array<MedicationDispense>
): MedicationDispenseStatus {
  const sorted = medicationDispenses?.sort(
    sortMedicationDispensesByDateRecorded
  );
  return sorted && sorted.length > 0 ? sorted[0].status : null;
}

/**
 * Given a set of medication requests, return the status of the one with the next most recent recorded date
 * (used when deleting the most recent, as we may need to update fulfiller status based on the next recent)
 */
export function getNextMostRecentMedicationDispenseStatus(
  medicationDispenses: Array<MedicationDispense>
): MedicationDispenseStatus {
  const sorted = medicationDispenses?.sort(
    sortMedicationDispensesByDateRecorded
  );
  return sorted && sorted.length > 1 ? sorted[1].status : null;
}

/**
 * Given a FHIR Medication, returns the string value stored in the "http://fhir.openmrs.org/ext/medicine#drugName" extension
 * @param medication
 */
export function getOpenMRSMedicineDrugName(medication: Medication): string {
  if (!medication || !medication.extension) {
    return null;
  }

  const medicineExtension = medication.extension.find(
    (ext) => ext.url === OPENMRS_FHIR_EXT_MEDICINE
  );

  if (!medicineExtension || !medicineExtension.extension) {
    return null;
  }

  const medicationExtensionDrugName = medicineExtension.extension.find(
    (ext) => ext.url === OPENMRS_FHIR_EXT_MEDICINE + "#drugName"
  );

  return medicationExtensionDrugName
    ? medicationExtensionDrugName.valueString
    : null;
}

export function getPrescriptionDetailsEndpoint(encounterUuid: string): string {
  return `${fhirBaseUrl}/${PRESCRIPTION_DETAILS_ENDPOINT}?encounter=${encounterUuid}&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter`;
}

export function getPrescriptionTableActiveMedicationRequestsEndpoint(
  pageOffset: number,
  pageSize: number,
  date: string,
  patientSearchTerm: string,
  location: string
): string {
  return appendSearchTermAndLocation(
    `${fhirBaseUrl}/${PRESCRIPTIONS_TABLE_ENDPOINT}&_getpagesoffset=${pageOffset}&_count=${pageSize}&date=ge${date}&status=active`,
    patientSearchTerm,
    location
  );
}

export function getPrescriptionTableAllMedicationRequestsEndpoint(
  pageOffset: number,
  pageSize: number,
  patientSearchTerm: string,
  location: string
): string {
  return appendSearchTermAndLocation(
    `${fhirBaseUrl}/${PRESCRIPTIONS_TABLE_ENDPOINT}&_getpagesoffset=${pageOffset}&_count=${pageSize}`,
    patientSearchTerm,
    location
  );
}

function appendSearchTermAndLocation(
  url: string,
  patientSearchTerm: string,
  location: string
): string {
  if (patientSearchTerm) {
    url = `${url}&patientSearchTerm=${patientSearchTerm}`;
  }
  if (location) {
    url = `${url}&location=${location}`;
  }
  return url;
}

export function getQuantity(
  resource: MedicationRequest | MedicationDispense
): Quantity {
  if (resource.resourceType == "MedicationRequest") {
    return (resource as MedicationRequest).dispenseRequest?.quantity;
  }
  if (resource.resourceType == "MedicationDispense") {
    return (resource as MedicationDispense).quantity;
  }
}

/**
 * Returns true/false whether the quantity units on all the resources are identical (or match)
 * @param resources
 */
export function getQuantityUnitsMatch(
  resources: Array<MedicationRequest | MedicationDispense>
): boolean {
  if (resources) {
    const quantityUnitsArray = resources
      .map((resource) => getQuantity(resource)?.code)
      .filter((quantity) => quantity);
    if (quantityUnitsArray.length > 0) {
      return quantityUnitsArray.every(
        (element) => element === quantityUnitsArray[0]
      );
    } else {
      return true; // consider true if empty
    }
  } else {
    return true; // consider true if null
  }
}

export function getRefillsAllowed(
  resource: MedicationRequest | MedicationDispense
): number {
  if (resource.resourceType == "MedicationRequest") {
    return (resource as MedicationRequest).dispenseRequest
      ?.numberOfRepeatsAllowed;
  } else {
    return null; // dispense doesn't have a "refills allowed" component
  }
}

/**
 * Given a refernece in format "MedicationReference/uuid" or just "uuid", returns just the uuid compoennt
 */
export function getUuidFromReference(reference: string): string {
  if (reference?.includes("/")) {
    return reference.split("/")[1];
  } else {
    return reference;
  }
}

/**
 * Returns true/false whether the most passed in medication dispense status is the most recent
 * @param medicationDispenses
 */
export function isMostRecentMedicationDispense(
  medicationDispense: MedicationDispense,
  medicationDispenses: Array<MedicationDispense>
): boolean {
  const sorted = medicationDispenses?.sort(
    sortMedicationDispensesByDateRecorded
  );

  // prettier-ignore
  return medicationDispense &&
    sorted &&
    sorted.length > 0 &&
    sorted[0].id === medicationDispense.id ? true : false;
}

/**
 * Revalidated (reloads) both the prescription associated with the encounter uuid,
 * and the entire prescrption table
 * @param encounterUuid
 */
export function revalidate(encounterUuid: string) {
  mutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith(`${fhirBaseUrl}/${PRESCRIPTIONS_TABLE_ENDPOINT}`) ||
        key.startsWith(
          `${fhirBaseUrl}/${PRESCRIPTION_DETAILS_ENDPOINT}?encounter=${encounterUuid}`
        ))
  );
}

export function sortMedicationDispensesByDateRecorded(
  a: MedicationDispense,
  b: MedicationDispense
): number {
  const dateDiff =
    parseDate(getDateRecorded(b)).getTime() -
    parseDate(getDateRecorded(a)).getTime();
  if (dateDiff !== 0) {
    return dateDiff;
  } else {
    return a.id.localeCompare(b.id); // just to enforce a standard order if two dates are equals
  }
}
