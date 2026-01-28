import React, { type ReactNode } from 'react';
import classNames from 'classnames';
import { Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { type DosageInstruction, type MedicationDispense, type MedicationRequest, type Quantity } from '../types';
import {
  calculateIsFreeTextDosage,
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getQuantity,
  getRefillsAllowed,
} from '../utils';
import styles from './medication-event.scss';

/**
 * Renders a prescription request of a prescript event (ex: ordered, dispensed)
 */
const MedicationEvent: React.FC<{
  medicationEvent: MedicationRequest | MedicationDispense;
  status?: ReactNode;
  children?: ReactNode;
  isDispenseEvent?: boolean;
}> = ({ medicationEvent, status = null, children, isDispenseEvent }) => {
  const { t } = useTranslation();
  const dosageInstruction: DosageInstruction | null = getDosageInstruction(medicationEvent.dosageInstruction);
  const isFreeTextDosage = calculateIsFreeTextDosage(dosageInstruction);
  const quantity: Quantity = getQuantity(medicationEvent);
  const refillsAllowed: number = getRefillsAllowed(medicationEvent);
  const isTablet = !isDesktop(useLayoutType());

  return (
    <Tile
      className={classNames({
        [styles.medicationEventTile]: true,
        [styles.dispenseEvent]: isDispenseEvent,
        [styles.isTablet]: isTablet,
      })}>
      <div>
        <p className={styles.medicationName}>
          {status}
          {status && ' '}
          <strong>{getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}</strong>
        </p>

        {!isFreeTextDosage && (
          <p className={styles.bodyLong01}>
            <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
            <span className={styles.dosage}>
              {dosageInstruction?.doseAndRate &&
                dosageInstruction.doseAndRate.map((doseAndRate, index) => {
                  return (
                    <span key={index}>
                      {doseAndRate?.doseQuantity?.value} {doseAndRate?.doseQuantity?.unit}
                    </span>
                  );
                })}
            </span>
            {dosageInstruction?.route?.text && <> &mdash; {dosageInstruction.route.text}</>}
            {dosageInstruction?.timing?.code?.text && <> &mdash; {dosageInstruction.timing.code.text}</>}
            {dosageInstruction?.timing?.repeat?.duration && (
              <>
                {' '}
                for {dosageInstruction.timing.repeat.duration} {dosageInstruction.timing.repeat.durationUnit}
              </>
            )}
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
      {children}
    </Tile>
  );
};

export default MedicationEvent;
