import React from 'react';
import { Layer } from '@carbon/react';
import PrescriptionPrintAction from '../print-prescription/prescription-print-action.component';
import LabelPrintAction from '../print-label/label-print-action.component';
import styles from './prescription-actions.scss';

type PrescriptionsActionsFooterProps = {
  encounterUuid: string;
  patientUuid: string;
};

const PrescriptionsActionsFooter: React.FC<PrescriptionsActionsFooterProps> = ({ encounterUuid, patientUuid }) => {
  return (
    <Layer className={styles.actionsContainer}>
      <div className={styles.actionCluster}>
        {/* Left buttons */}
        <PrescriptionPrintAction encounterUuid={encounterUuid} patientUuid={patientUuid} />
        <LabelPrintAction encounterUuid={encounterUuid} patientUuid={patientUuid} />
      </div>

      <div className={styles.actionCluster}>{/* Right buttons */}</div>
    </Layer>
  );
};

export default PrescriptionsActionsFooter;
