import React from 'react';
import { Layer } from '@carbon/react';
import PrescriptionPrintAction from '../print-prescription/prescription-print-action.component';
import styles from './prescription-actions.scss';
import { useConfig } from '@openmrs/esm-framework';
import type { PharmacyConfig } from '../config-schema';

type PrescriptionsActionsFooterProps = {
  encounterUuid: string;
  patientUuid: string;
};

const PrescriptionsActionsFooter: React.FC<PrescriptionsActionsFooterProps> = ({ encounterUuid, patientUuid }) => {
  const config = useConfig<PharmacyConfig>();

  return (
    <Layer className={styles.actionsContainer}>
      <div className={styles.actionCluster}>
        {/* Left buttons */}
        {config.actionButtons.printPrescriptionsButton.enabled && (
          <PrescriptionPrintAction encounterUuid={encounterUuid} patientUuid={patientUuid} />
        )}
      </div>

      <div className={styles.actionCluster}>{/* Right buttons */}</div>
    </Layer>
  );
};

export default PrescriptionsActionsFooter;
