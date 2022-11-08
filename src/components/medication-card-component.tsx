import React from "react";
import { Tile } from "@carbon/react";
import { Medication } from "../types";
import styles from "./medication-card.scss";
import { useTranslation } from "react-i18next";

// TODO this will probably need a fair amount of updates to allow editing

const MedicationCard: React.FC<{
  medication: Medication;
}> = ({ medication }) => {
  const { t } = useTranslation();

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
      </div>
    </Tile>
  );
};

export default MedicationCard;
