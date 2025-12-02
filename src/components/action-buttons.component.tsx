import React from 'react';
import { ExtensionSlot, useConfig, useSession } from '@openmrs/esm-framework';
import { MedicationDispenseStatus, type MedicationRequestBundle, MedicationRequestStatus } from '../types';
import {
  computeMedicationRequestStatus,
  computeQuantityRemainingWithWarning,
  getMostRecentMedicationDispenseStatus,
  computeTotalQuantityDispensedWithWarning,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { useProviders } from '../medication-dispense/medication-dispense.resource';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
  disabled: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
  disabled,
}) => {
  const config = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);
  const mostRecentMedicationDispenseStatus: MedicationDispenseStatus = getMostRecentMedicationDispenseStatus(
    medicationRequestBundle.dispenses,
  );
  const medicationRequestStatus = computeMedicationRequestStatus(
    medicationRequestBundle.request,
    config.medicationRequestExpirationPeriodInDays,
  );
  const dispensable =
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const pauseable =
    config.actionButtons.pauseButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.on_hold &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const closeable =
    config.actionButtons.closeButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  let quantityRemaining = null;
  let hasUnitMismatch = false;
  if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
    const remainingResult = computeQuantityRemainingWithWarning(medicationRequestBundle);
    quantityRemaining = remainingResult.quantity;
    hasUnitMismatch = remainingResult.hasUnitMismatch;
  }

  let quantityDispensed = 0;
  if (medicationRequestBundle.dispenses) {
    const dispensedResult = computeTotalQuantityDispensedWithWarning(medicationRequestBundle.dispenses);
    quantityDispensed = dispensedResult.quantity;
    hasUnitMismatch = hasUnitMismatch || dispensedResult.hasUnitMismatch;
  }

  const prescriptionActionsState = {
    dispensable,
    pauseable,
    closeable,
    quantityRemaining,
    quantityDispensed,
    hasUnitMismatch,
    patientUuid,
    encounterUuid,
    medicationRequestBundle,
    session,
    providers,
    disabled,
  };

  return (
    <div className={styles.actionBtns}>
      <ExtensionSlot
        className={styles.extensionSlot}
        name="prescription-action-button-slot"
        state={prescriptionActionsState}
      />
    </div>
  );
};

export default ActionButtons;
