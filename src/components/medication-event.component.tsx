import React from "react";
import {
  DosageInstruction,
  MedicationDispense,
  MedicationRequest,
  Quantity,
} from "../types";
import styles from "./medication-event.scss";
import {
  getDosageInstruction,
  getQuantity,
  getRefillsAllowed,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
} from "../utils";
import { useTranslation } from "react-i18next";

// can render MedicationRequest or MedicationDispense
const MedicationEvent: React.FC<{
  medicationEvent: MedicationRequest | MedicationDispense;
  status?;
}> = ({ medicationEvent, status = null }) => {
  const { t } = useTranslation();
  const dosageInstruction: DosageInstruction = getDosageInstruction(
    medicationEvent.dosageInstruction
  );
  const quantity: Quantity = getQuantity(medicationEvent);
  const refillsAllowed: number = getRefillsAllowed(medicationEvent);

  return (
    <div>
      <p className={styles.medicationName}>
        {status}
        <strong>
          {getMedicationDisplay(
            getMedicationReferenceOrCodeableConcept(medicationEvent)
          )}
        </strong>
      </p>
      <p className={styles.bodyLong01}>
        <span className={styles.label01}>
          {t("dose", "Dose").toUpperCase()}
        </span>{" "}
        {dosageInstruction && (
          <>
            <span className={styles.dosage}>
              {dosageInstruction.doseAndRate &&
                dosageInstruction?.doseAndRate.map((doseAndRate, index) => {
                  return (
                    <span key={index}>
                      {doseAndRate?.doseQuantity?.value}{" "}
                      {doseAndRate?.doseQuantity?.unit}
                    </span>
                  );
                })}
            </span>{" "}
            &mdash; {dosageInstruction?.route?.text} &mdash;{" "}
            {dosageInstruction?.timing?.code?.text}{" "}
            {dosageInstruction?.timing?.repeat?.duration
              ? "for " +
                dosageInstruction?.timing?.repeat?.duration +
                " " +
                dosageInstruction?.timing?.repeat?.durationUnit
              : " "}
          </>
        )}
      </p>
      <p className={styles.bodyLong01}>
        <span className={styles.label01}>
          {t("quantity", "Quantity").toUpperCase()}
        </span>{" "}
        {quantity && (
          <span className={styles.quantity}>
            {quantity.value} {quantity.unit}
          </span>
        )}
      </p>
      {(refillsAllowed || refillsAllowed === 0) && (
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>
            {t("refills", "Refills").toUpperCase()}
          </span>{" "}
          <span className={styles.refills}>{refillsAllowed}</span>
        </p>
      )}
      {dosageInstruction?.text && (
        <p className={styles.bodyLong01}>{dosageInstruction.text}</p>
      )}
    </div>
  );
};

export default MedicationEvent;
