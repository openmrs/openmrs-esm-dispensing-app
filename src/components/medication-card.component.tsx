import React from 'react';
import { IconButton, Tile } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { type MedicationReferenceOrCodeableConcept } from '../types';
import { getMedicationDisplay } from '../utils';
import styles from './medication-card.scss';

const MedicationCard: React.FC<{
  medication: MedicationReferenceOrCodeableConcept;
  editAction?: () => void;
}> = ({ medication, editAction }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.medicationTile}>
      <p className={styles.medicationName}>
        <strong>{getMedicationDisplay(medication)}</strong>
      </p>
      {editAction && (
        <span className={styles.editButton}>
          <IconButton align="bottom" kind="ghost" label={t('edit', 'Edit')} onClick={editAction} size="sm">
            <Edit />
          </IconButton>
        </span>
      )}
    </Tile>
  );
};

export default MedicationCard;
