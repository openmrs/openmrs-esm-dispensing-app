import React from "react";
import {
  DosageInstruction,
  MedicationDispense,
  MedicationRequest,
  Quantity,
} from "../types";
import styles from "./medication-event-card.scss";
import { getDosageInstruction, getQuantity, getRefillsAllowed } from "../utils";
import { Tile, OverflowMenu } from "@carbon/react";
import { useTranslation } from "react-i18next";

// can render MedicationRequest or MedicationDispense
const MedicationEventCard: React.FC<{
  medication: MedicationRequest | MedicationDispense;
  actionMenu?: OverflowMenu;
}> = ({ medication, actionMenu = null }) => {
  const { t } = useTranslation();
  const dosageInstruction: DosageInstruction = getDosageInstruction(
    medication.dosageInstruction
  );
  const quantity: Quantity = getQuantity(medication);
  const refillsAllowed: number = getRefillsAllowed(medication);

  return (
    <Tile className={styles.medicationEventTile}>
      {actionMenu}
      <div>
        <p className={styles.medicationName}>
          <strong>
            {medication.medicationReference
              ? medication.medicationReference.display
              : medication?.medicationCodeableConcept.text}
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
                  dosageInstruction?.doseAndRate.map((doseAndRate) => {
                    return (
                      <>
                        {doseAndRate?.doseQuantity?.value}{" "}
                        {doseAndRate?.doseQuantity?.unit}
                      </>
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
    </Tile>
  );
};

export default MedicationEventCard;
