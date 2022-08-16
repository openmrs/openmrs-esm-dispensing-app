import React from "react";
import { DosageInstruction, MedicationRequest } from "../types";
import styles from "./medication-card.scss";
import { getDosageInstruction } from "../utils";
import { Tile } from "carbon-components-react";
import { useTranslation } from "react-i18next";

const MedicationCard: React.FC<{ medication: MedicationRequest }> = ({
  medication,
}) => {
  const { t } = useTranslation();
  const dosageInstruction: DosageInstruction = getDosageInstruction(
    medication.dosageInstruction
  );

  return (
    <Tile className={styles.medicationTile}>
      <div>
        <p className={styles.medicationName}>
          <strong>{medication.medicationReference?.display}</strong>
        </p>
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>
            {t("dose", "Dose").toUpperCase()}
          </span>{" "}
          <span className={styles.dosage}>
            {dosageInstruction?.doseAndRate[0]?.doseQuantity?.value}{" "}
            {dosageInstruction?.doseAndRate[0]?.doseQuantity?.unit}
          </span>{" "}
          &mdash; {dosageInstruction?.route?.text} &mdash;{" "}
          {dosageInstruction?.timing?.code?.text}{" "}
          {dosageInstruction?.timing?.repeat?.duration
            ? "for " +
              dosageInstruction?.timing?.repeat?.duration +
              " " +
              dosageInstruction?.timing?.repeat?.durationUnit
            : " "}
        </p>
      </div>
    </Tile>
  );
};

export default MedicationCard;
