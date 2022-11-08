import {
  DosageInstruction,
  MedicationDispense,
  MedicationRequest,
  Quantity,
} from "./types";

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
