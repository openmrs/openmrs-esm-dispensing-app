import React from "react";
import { DosageInstruction, MedicationDispense } from "../types";
import styles from "./medication-card.scss";
import { getDosageInstruction } from "../utils";
import { Tile } from "@carbon/react";

const DispenseCard: React.FC<{ medication: MedicationDispense }> = ({
  medication,
}) => {
  const dosageInstruction: DosageInstruction = getDosageInstruction(
    medication.dosageInstruction
  );

  return (
    <Tile className={styles.medicationTile}>
      <div>
        <p className={styles.medicationName}>
          <strong>
            {medication.medicationReference
              ? medication.medicationReference.display
              : medication?.medicationCodeableConcept.text}
          </strong>
        </p>
        <p className={styles.bodyLong01}>
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
      </div>
    </Tile>
  );
};

export default DispenseCard;
