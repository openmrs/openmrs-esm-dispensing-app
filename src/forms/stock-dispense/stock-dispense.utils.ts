import { type InventoryItem, type MedicationDispense } from '../../types';

export function isUnexpired(inventoryItem: InventoryItem, referenceDate: Date) {
  return new Date(inventoryItem.expiration) > referenceDate;
}

export function isValidBatch(
  medicationToDispense: MedicationDispense,
  inventoryItem: InventoryItem,
  validateBatch: boolean,
  referenceDate = new Date(),
) {
  if (!validateBatch) {
    return true;
  }

  const instructions = medicationToDispense?.dosageInstruction ?? [];

  const instructionsWithDuration = instructions.filter(
    (instruction) => instruction.timing?.repeat?.duration && instruction.timing?.repeat?.durationUnit,
  );

  // O3-6021: prescriptions without a duration should still allow
  // available, unexpired stock batches to be dispensed.
  if (instructionsWithDuration.length === 0) {
    return inventoryItem.quantity > 0 && isUnexpired(inventoryItem, referenceDate);
  }

  return instructionsWithDuration.some((instruction) => {
    const durationUnit = instruction.timing.repeat.durationUnit;
    const durationValue = instruction.timing.repeat.duration;
    const lastMedicationDate = new Date(referenceDate);

    switch (durationUnit) {
      case 's':
        lastMedicationDate.setSeconds(lastMedicationDate.getSeconds() + durationValue);
        break;
      case 'min':
        lastMedicationDate.setMinutes(lastMedicationDate.getMinutes() + durationValue);
        break;
      case 'h':
        lastMedicationDate.setHours(lastMedicationDate.getHours() + durationValue);
        break;
      case 'd':
        lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue);
        break;
      case 'wk':
        lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue * 7);
        break;
      case 'mo':
        lastMedicationDate.setMonth(lastMedicationDate.getMonth() + durationValue);
        break;
      case 'a':
      case 'y':
        lastMedicationDate.setFullYear(lastMedicationDate.getFullYear() + durationValue);
        break;
      default:
        return false;
    }

    return inventoryItem.quantity > 0 && isUnexpired(inventoryItem, lastMedicationDate);
  });
}
