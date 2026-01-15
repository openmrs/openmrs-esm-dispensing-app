import React, { type ReactSVGElement } from 'react';
import { Tile } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { type MedicationReferenceOrCodeableConcept } from '../types';
import { getMedicationDisplay } from '../utils';
import styles from './medication-card.scss';

/**
 * This component shows up in the dispensing form to display the medication to be dispensed
 */
const MedicationCard: React.FC<{
  medication: MedicationReferenceOrCodeableConcept;
  editAction?: Function;
}> = ({ medication, editAction }) => {
  return (
    <Tile className={styles.medicationTile}>
      <p className={styles.medicationName}>
        <strong>{getMedicationDisplay(medication)}</strong>
      </p>
      {editAction && <Edit onClick={editAction as React.MouseEventHandler<ReactSVGElement>} />}
    </Tile>
  );
};

export default MedicationCard;
