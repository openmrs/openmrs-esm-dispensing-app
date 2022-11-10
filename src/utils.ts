import {
  DosageInstruction,
  Medication,
  MedicationDispense,
  MedicationRequest,
  Quantity,
} from "./types";
import { fhirBaseUrl } from "@openmrs/esm-framework";

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
    return (resource as MedicationRequest).dispenseRequest.quantity;
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
    return null; // dispense doesn'r haee a "refills allowed" component
  }
}

// TODO does this need to null-check
export function getMedication(
  resource: MedicationRequest | MedicationDispense
): Medication {
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
  patientSearchTerm: string
) {
  return `${fhirBaseUrl}/Encounter?_getpagesoffset=${pageOffset}&_count=${pageSize}&subject.name=${patientSearchTerm}&_revinclude=MedicationRequest:encounter&_revinclude:iterate=MedicationDispense:prescription&_has:MedicationRequest:encounter:intent=order&_sort=-date&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter`;
}
