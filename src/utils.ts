import {
  Coding,
  DosageInstruction,
  Medication,
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationReferenceOrCodeableConcept,
  MedicationRequest,
  MedicationRequestMedicationDispenseCombinedStatus,
  MedicationRequestStatus,
  Quantity,
} from "./types";
import { fhirBaseUrl, parseDate } from "@openmrs/esm-framework";
import {
  OPENMRS_FHIR_EXT_MEDICINE,
  OPENMRS_FHIR_EXT_RECORDED,
} from "./constants";
import dayjs from "dayjs";

// TODO this may end up being handled by the enhanced medication request status?
export function computeMedicationRequestMedicationDispenseCombinedStatus(
  medicationRequestStatus: MedicationRequestStatus,
  medicationDispenseStatus: MedicationDispenseStatus
) {
  // if the request is no longer active, that status takes precedent
  if (medicationRequestStatus !== MedicationRequestStatus.active) {
    if (medicationRequestStatus === MedicationRequestStatus.expired) {
      return MedicationRequestMedicationDispenseCombinedStatus.expired;
    } else if (medicationRequestStatus === MedicationRequestStatus.completed) {
      return MedicationRequestMedicationDispenseCombinedStatus.completed;
    } else if (medicationRequestStatus === MedicationRequestStatus.cancelled) {
      return MedicationRequestMedicationDispenseCombinedStatus.cancelled;
    }
  }
  // otherwise, if the medication dispense status is paused or closed, return that
  if (medicationDispenseStatus === MedicationDispenseStatus.declined) {
    return MedicationRequestMedicationDispenseCombinedStatus.declined;
  } else if (medicationDispenseStatus === MedicationDispenseStatus.on_hold) {
    return MedicationRequestMedicationDispenseCombinedStatus.on_hold;
  }

  // otherwise, return active
  return MedicationRequestMedicationDispenseCombinedStatus.active;
}

export function computeMedicationRequestStatus(
  medicationRequest: MedicationRequest,
  medicationRequestExpirationPeriodInDays: number
) {
  if (
    medicationRequest.status === MedicationRequestStatus.cancelled ||
    medicationRequest.status === MedicationRequestStatus.completed
  ) {
    return medicationRequest.status;
  }

  // expired is not based on based actual medication request expired status, but calculated from our configurable expiration period in days
  // NOTE: the assumption here is that the validityPeriod.start is equal to encounter datetime of the associated encounter, because we use the encounter date when querying and calculating the status of the overall encounter
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
 * Given a medication request and an array of medication dispenses, fetch all dispenses authorized by that request
 *
 * @param medicationRequest
 * @param medicationDispenses
 */
export function getAssociatedMedicationDispenses(
  medicationRequest: MedicationRequest,
  medicationDispenses: Array<MedicationDispense>
) {
  return medicationDispenses?.filter((medicationDispense) =>
    medicationDispense?.authorizingPrescription?.some((prescription) =>
      prescription.reference.endsWith(medicationRequest.id)
    )
  );
}

/**
 * Given an array of CodeableConcept codings, return the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCoding(codings: Coding[]) {
  return codings
    ? codings.find((c) => !("system" in c) || c.system === undefined)
    : null;
}

/**
 * Given an array of CodeableConcept codings, return the display for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingDisplay(codings: Coding[]) {
  return getConceptCoding(codings)?.display;
}

/**
 * Given an array of CodeableConcept codings, return the code for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingUuid(codings: Coding[]) {
  return getConceptCoding(codings)?.code;
}

/**
 * Fetch the "recorded" extension off a medication request
 * @param medicationDispense
 */
export function getDateRecorded(medicationDispense: MedicationDispense) {
  return medicationDispense?.extension?.find(
    (ext) => ext.url === OPENMRS_FHIR_EXT_RECORDED
  )?.valueDateTime;
}

export function getDosageInstruction(
  dosageInstructions: Array<DosageInstruction>
) {
  if (dosageInstructions?.length > 0) {
    return dosageInstructions[0];
  }
  return null;
}

export function getMedicationsByConceptEndpoint(conceptUuid: string) {
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
) {
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
) {
  const sorted = medicationDispenses?.sort(
    sortMedicationDispensesByDateRecorded
  );
  return sorted && sorted.length > 0 ? sorted[0].status : null;
}

/**
 * Given a FHIR Medication, returns the string value stored in the "http://fhir.openmrs.org/ext/medicine#drugName" extension
 * @param medication
 */
export function getOpenMRSMedicineDrugName(medication: Medication) {
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

export function getPrescriptionDetailsEndpoint(encounterUuid: string) {
  return `${fhirBaseUrl}/MedicationRequest?encounter=${encounterUuid}&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter`;
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

export function getPrescriptionTableActiveMedicationRequestsEndpoint(
  pageOffset: number,
  pageSize: number,
  date: string,
  patientSearchTerm: string,
  location: string
) {
  return appendSearchTermAndLocation(
    `${fhirBaseUrl}/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=${pageOffset}&_count=${pageSize}&date=ge${date}&status=active`,
    patientSearchTerm,
    location
  );
}

export function getPrescriptionTableAllMedicationRequestsEndpoint(
  pageOffset: number,
  pageSize: number,
  patientSearchTerm: string,
  location: string
) {
  return appendSearchTermAndLocation(
    `${fhirBaseUrl}/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=${pageOffset}&_count=${pageSize}`,
    patientSearchTerm,
    location
  );
}

function appendSearchTermAndLocation(
  url: string,
  patientSearchTerm: string,
  location: string
) {
  if (patientSearchTerm) {
    url = `${url}&patientSearchTerm=${patientSearchTerm}`;
  }
  if (location) {
    url = `${url}&location=${location}`;
  }
  return url;
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

export function sortMedicationDispensesByDateRecorded(
  a: MedicationDispense,
  b: MedicationDispense
) {
  const dateDiff =
    parseDate(getDateRecorded(b)).getTime() -
    parseDate(getDateRecorded(a)).getTime();
  if (dateDiff !== 0) {
    return dateDiff;
  } else {
    return a.id.localeCompare(b.id); // just to enforce a standard order if two dates are equals
  }
}
