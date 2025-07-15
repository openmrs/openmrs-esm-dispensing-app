import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useConfig, useSession } from '@openmrs/esm-framework';
import { MedicationDispenseStatus, type MedicationRequestBundle, MedicationRequestStatus } from '../types';
import {
  computeMedicationRequestStatus,
  computeQuantityRemaining,
  getMostRecentMedicationDispenseStatus,
  computeTotalQuantityDispensed,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { useProviders } from '../medication-dispense/medication-dispense.resource';
import styles from './action-buttons.scss';

interface ActionButtonsProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ medicationRequestBundle, patientUuid, encounterUuid }) => {
  const { t } = useTranslation();
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
  if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
    quantityRemaining = computeQuantityRemaining(medicationRequestBundle);
  }

  let quantityDispensed = 0;
  if (medicationRequestBundle.dispenses) {
    quantityDispensed = computeTotalQuantityDispensed(medicationRequestBundle.dispenses);
  }

  const prescriptionActionsState = {
    dispensable,
    pauseable,
    closeable,
    quantityRemaining,
    quantityDispensed,
    patientUuid,
    encounterUuid,
    medicationRequestBundle,
    session,
    providers,
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
