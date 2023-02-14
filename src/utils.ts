import {
  DosageInstruction,
  MedicationReferenceOrCodeableConcept,
  MedicationDispense,
  MedicationRequest,
  Quantity,
  Coding,
  Medication,
} from "./types";
import { fhirBaseUrl } from "@openmrs/esm-framework";
import { OPENMRS_FHIR_EXT_MEDICINE } from "./constants";

/* TODO: confirm we can remove, not used but looks like it might do wrong thing anyway
export function getDosage(strength: string, doseNumber: number) {
  if (!strength || !doseNumber) {
    return "";
  }

  const i = strength.search(/\D/);
  const strengthQuantity = +strength.substring(0, i);

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = +strength.substr(
      concentrationStartIndex + 1,
      j
    );
    const concentrationUnits = strength.substring(
      concentrationStartIndex + 1 + j
    );
    return `${doseNumber} ${strengthUnits} (${
      (doseNumber / strengthQuantity) * concentrationQuantity
    } ${concentrationUnits})`;
  } else {
    return `${strengthQuantity * doseNumber} ${strengthUnits}`;
  }
}
*/

export function getDosageInstruction(
  dosageInstructions: Array<DosageInstruction>
) {
  if (dosageInstructions.length > 0) {
    return dosageInstructions[0];
  }
  return null;
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

export function getRefillsAllowed(
  resource: MedicationRequest | MedicationDispense
): number {
  if (resource.resourceType == "MedicationRequest") {
    return (resource as MedicationRequest).dispenseRequest
      ?.numberOfRepeatsAllowed;
  } else {
    return null; // dispense doesn't haee a "refills allowed" component
  }
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

export function getPrescriptionDetailsEndpoint(encounterUuid: string) {
  return `${fhirBaseUrl}/MedicationRequest?encounter=${encounterUuid}&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter`;
}

export function getPrescriptionTableActiveMedicationRequestsEndpoint(
  pageOffset: number,
  pageSize: number,
  patientSearchTerm: string,
  date: string
) {
  return `${fhirBaseUrl}/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=${pageOffset}&_count=${pageSize}&patientSearchTerm=${patientSearchTerm}&date=ge${date}&status=active`;
}

export function getPrescriptionTableAllMedicationRequestsEnpointEndpoint(
  pageOffset: number,
  pageSize: number,
  patientSearchTerm: string
) {
  return `${fhirBaseUrl}/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=${pageOffset}&_count=${pageSize}&patientSearchTerm=${patientSearchTerm}`;
}

export function getMedicationsByConceptEndpoint(conceptUuid: string) {
  return `${fhirBaseUrl}/Medication?code=${conceptUuid}`;
}

/**
 * Given an array of CodeableConcept codings, return the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCoding(codings: Coding[]) {
  return codings ? codings.find((c) => !("system" in c)) : null;
}

/**
 * Given an array of CodeableConcept codings, return the code for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingUuid(codings: Coding[]) {
  return getConceptCoding(codings)?.code;
}

/**
 * Given an array of CodeableConcept codings, return the display for the first one without an associated system (which should be the concept-referenced-by-uuid coding)
 * @param codings
 */
export function getConceptCodingDisplay(codings: Coding[]) {
  return getConceptCoding(codings)?.display;
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
