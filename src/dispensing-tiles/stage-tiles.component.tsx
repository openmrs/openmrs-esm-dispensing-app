import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClickableTile, SkeletonText } from '@carbon/react';
import { type PrescriptionStage } from '../types';
import styles from './stage-tiles.scss';

interface StageTilesProps {
  counts: Record<PrescriptionStage, number>;
  isLoading: boolean;
  selectedStage?: PrescriptionStage;
  onSelect: (stage: PrescriptionStage) => void;
}

/** Lab-style summary tiles: how many prescriptions are in each stage. Clicking one opens its tab. */
const StageTiles: React.FC<StageTilesProps> = ({ counts, isLoading, selectedStage, onSelect }) => {
  const { t } = useTranslation();
  const tiles: Array<{ stage: PrescriptionStage; label: string; caption: string }> = [
    { stage: 'ordered', label: t('ordered', 'Ordered'), caption: t('waitingForPharmacy', 'Waiting for the pharmacy') },
    { stage: 'picked', label: t('picked', 'Picked'), caption: t('beingPrepared', 'Being prepared') },
    { stage: 'dispensed', label: t('dispensed', 'Dispensed'), caption: t('handedToPatient', 'Handed to the patient') },
    {
      stage: 'declined',
      label: t('declined', 'Declined'),
      caption: t('notDispensedWithReason', 'Not dispensed, with a reason'),
    },
  ];

  return (
    <div className={styles.tiles}>
      {tiles.map(({ stage, label, caption }) => (
        <ClickableTile
          key={stage}
          className={stage === selectedStage ? styles.selectedTile : styles.tile}
          onClick={() => onSelect(stage)}>
          <p className={styles.label}>{label}</p>
          {isLoading ? <SkeletonText heading width="40%" /> : <p className={styles.count}>{counts[stage]}</p>}
          <p className={styles.caption}>{caption}</p>
        </ClickableTile>
      ))}
    </div>
  );
};

export default StageTiles;
