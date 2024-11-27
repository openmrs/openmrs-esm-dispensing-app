import React from 'react';
import PrescriptionPrintAction from '../print-prescription/prescription-print-action.component';
import styles from './prescriptions-actions.scss';
import { Layer } from '@carbon/react';
type PrescriptionsActionsFooterProps = {
  encounterUuid: string;
  patientUuid: string;
};

const PrescriptionsActionsFooter: React.FC<PrescriptionsActionsFooterProps> = ({ encounterUuid, patientUuid }) => {
  return (
    <Layer className={styles.actionsContainer}>
      <div className={styles.actionsContainer}>
        {/* Left buttons */}
        <PrescriptionPrintAction encounterUuid={encounterUuid} patientUuid={patientUuid} />
      </div>

      <div className={styles.actionsContainer}>{/* Right buttons */}</div>
    </Layer>
  );
};

export default PrescriptionsActionsFooter;
