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

export function getPrescriptionTableEndpoint(
  pageOffset: number,
  pageSize: number,
  patientSearchTerm: string,
  status: string
) {
  return `${fhirBaseUrl}/Encounter?_getpagesoffset=${pageOffset}&_count=${pageSize}&subject.name=${patientSearchTerm}&_revinclude=MedicationRequest:encounter&_revinclude:iterate=MedicationDispense:prescription&_has:MedicationRequest:encounter:status=${status}&_sort=-date&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter`;
}

export function getMedicationsByConceptEndpoint(conceptUuid: string) {
  return `${fhirBaseUrl}/Medication?code=${conceptUuid}`;
}

/**
 * Given an array of CodeableConcept condings, return the first one without an associated system (which should be the uuid of the underyling concept)
 * @param codings
 */
export function getConceptUuidCoding(codings: Coding[]) {
  // the concept uuid code is always the one without a system
  return codings ? codings.find((c) => !("system" in c))?.code : null;
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
