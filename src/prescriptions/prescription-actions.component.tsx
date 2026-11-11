import React from 'react';
import { Layer } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { PRESCRIPTION_ACTIONS_FOOTER_SLOT } from '../constants';
import styles from './prescription-actions.scss';
import type { MedicationRequestBundle } from '../types';

type PrescriptionsActionsFooterProps = {
  encounterUuid: string;
  patientUuid: string;
  medicationRequestBundles: Array<MedicationRequestBundle>;
};

const PrescriptionsActionsFooter: React.FC<PrescriptionsActionsFooterProps> = ({
  encounterUuid,
  patientUuid,
  medicationRequestBundles,
}) => {
  return (
    <Layer className={styles.actionsContainer}>
      <div className={styles.actionCluster}>
        {/* Left buttons */}
        <ExtensionSlot
          name={PRESCRIPTION_ACTIONS_FOOTER_SLOT}
          state={{ encounterUuid, patientUuid, medicationRequestBundles }}
        />
      </div>

      <div className={styles.actionCluster}>{/* Right buttons */}</div>
    </Layer>
  );
};

export default PrescriptionsActionsFooter;
