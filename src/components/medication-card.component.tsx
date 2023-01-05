import React from "react";
import { Tile } from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { MedicationReferenceOrCodeableConcept } from "../types";
import styles from "./medication-card.scss";

const MedicationCard: React.FC<{
  medication: MedicationReferenceOrCodeableConcept;
  editAction?: Function;
}> = ({ medication, editAction }) => {
  return (
    <Tile className={styles.medicationTile}>
      <p className={styles.medicationName}>
        <strong>
          {medication.medicationReference
            ? medication.medicationReference.display
            : medication?.medicationCodeableConcept.text}
        </strong>
      </p>
      {editAction && <Edit onClick={editAction} />}
    </Tile>
  );
};

export default MedicationCard;
