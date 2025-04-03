import React from 'react';
import { useTranslation } from 'react-i18next';
import { type DosageInstruction, type MedicationDispense, type MedicationRequest, type Quantity } from '../types';
import {
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getQuantity,
  getRefillsAllowed,
} from '../utils';
import styles from './medication-event.scss';

// can render MedicationRequest or MedicationDispense
const MedicationEvent: React.FC<{
  medicationEvent: MedicationRequest | MedicationDispense;
  status?;
}> = ({ medicationEvent, status = null }) => {
  const { t } = useTranslation();
  const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
  const quantity: Quantity = getQuantity(medicationEvent);
  const refillsAllowed: number = getRefillsAllowed(medicationEvent);

  return (
    <div>
      <p className={styles.medicationName}>
        {status}
        <strong>{getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}</strong>
      </p>

      {dosageInstruction && (
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
          <span className={styles.dosage}>
            {dosageInstruction.doseAndRate &&
              dosageInstruction?.doseAndRate.map((doseAndRate, index) => {
                return (
                  <span key={index}>
                    {doseAndRate?.doseQuantity?.value} {doseAndRate?.doseQuantity?.unit}
                  </span>
                );
              })}
          </span>{' '}
          &mdash; {dosageInstruction?.route?.text} &mdash; {dosageInstruction?.timing?.code?.text}{' '}
          {dosageInstruction?.timing?.repeat?.duration
            ? 'for ' +
              dosageInstruction?.timing?.repeat?.duration +
              ' ' +
              dosageInstruction?.timing?.repeat?.durationUnit
            : ' '}
        </p>
      )}

      {quantity && (
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>{t('quantity', 'Quantity').toUpperCase()}</span>{' '}
          <span className={styles.quantity}>
            {quantity.value} {quantity.unit}
          </span>
        </p>
      )}

      {(refillsAllowed || refillsAllowed === 0) && (
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span>{' '}
          <span className={styles.refills}>{refillsAllowed}</span>
        </p>
      )}
      {dosageInstruction?.text && <p className={styles.bodyLong01}>{dosageInstruction.text}</p>}
      {dosageInstruction?.additionalInstruction?.length > 0 && (
        <p className={styles.bodyLong01}>{dosageInstruction?.additionalInstruction[0].text}</p>
      )}
    </div>
  );
};

export default MedicationEvent;
