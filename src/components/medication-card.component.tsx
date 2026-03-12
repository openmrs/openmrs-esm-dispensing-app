import React from 'react';
import { IconButton, Tile } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { type MedicationReferenceOrCodeableConcept } from '../types';
import { getMedicationDisplay } from '../utils';
import styles from './medication-card.scss';
import { useTranslation } from 'react-i18next';

/**
 * This component shows up in the dispensing form to display the medication to be dispensed
 */
const MedicationCard: React.FC<{
  medication: MedicationReferenceOrCodeableConcept;
  editAction?();
}> = ({ medication, editAction }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.medicationTile}>
      <p className={styles.medicationName}>
        <strong>{getMedicationDisplay(medication)}</strong>
      </p>
      {editAction && (
        <IconButton
          align="bottom-end"
          kind="ghost"
          size="sm"
          label={t('editFormulation', 'Edit formulation')}
          onClick={editAction}>
          <Edit />
        </IconButton>
      )}
    </Tile>
  );
};

export default MedicationCard;
