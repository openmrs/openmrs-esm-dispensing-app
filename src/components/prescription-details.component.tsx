import { Tile } from "carbon-components-react";
import React from "react";
import styles from "./prescription-details.scss";
import { WarningFilled24 } from "@carbon/icons-react";
import { formatDate } from "@openmrs/esm-framework";

const PrescriptionDetails: React.FC = () => {
  return (
    <div className={styles.prescriptionContainer}>
      <Tile className={styles.allergiesTile}>
        <div className={styles.allergesContent}>
          <div>
            <WarningFilled24 className={styles.allergiesIcon} />
            <p>
              <b>3 allergies</b> Penicillin, Naproxen sodium, Ibuprofen
            </p>
            <a href={`dispensing`} onClick={(e) => e.preventDefault()}>
              View
            </a>
          </div>
        </div>
      </Tile>

      <h5
        style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "0.9rem" }}
      >
        Prescribed
      </h5>
      <Tile className={styles.prescriptionTile}>
        Drug Orders
        {/* <div className={styles.medicationRecord}>
          <div>
            <p className={styles.bodyLong01}>
              <strong>{capitalize(medication.drug?.name)}</strong> &mdash; {medication.drug?.strength.toLowerCase()}{' '}
              &mdash; {medication.doseUnits?.display.toLowerCase()}
            </p>
            <p className={styles.bodyLong01}>
              <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
              <span className={styles.dosage}>
                {getDosage(medication.drug?.strength, medication.dose).toLowerCase()}
              </span>{' '}
              &mdash; {medication.route?.display.toLowerCase()} &mdash; {medication.frequency?.display.toLowerCase()}{' '}
              &mdash;{' '}
              {!medication.duration
                ? t('medicationIndefiniteDuration', 'Indefinite duration').toLowerCase()
                : t('medicationDurationAndUnit', 'for {duration} {durationUnit}', {
                  duration: medication.duration,
                  durationUnit: medication.durationUnits?.display.toLowerCase(),
                })}{' '}
              {medication.numRefills !== 0 && (
                <span>
                  <span className={styles.label01}> &mdash; {t('refills', 'Refills').toUpperCase()}</span>{' '}
                  {medication.numRefills}
                </span>
              )}
              {medication.dosingInstructions && (
                <span> &mdash; {medication.dosingInstructions.toLocaleLowerCase()}</span>
              )}
            </p>
          </div>
          <p className={styles.bodyLong01}>
            {medication.orderReasonNonCoded ? (
              <span>
                <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                {medication.orderReasonNonCoded}
              </span>
            ) : null}
            {medication.quantity ? (
              <span>
                <span className={styles.label01}> &mdash; {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
                {medication.quantity}
              </span>
            ) : null}
            {medication.dateStopped ? (
              <span className={styles.bodyShort01}>
                <span className={styles.label01}>
                  {medication.quantity ? ` — ` : ''} {t('endDate', 'End date').toUpperCase()}
                </span>{' '}
                {formatDate(new Date(medication.dateStopped))}
              </span>
            ) : null}
          </p>
        </div> */}
      </Tile>
    </div>
  );
};

export default PrescriptionDetails;
