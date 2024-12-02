import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { MedicationDispenseStatus, type MedicationRequestBundle, MedicationRequestStatus } from '../types';
import {
  computeMedicationRequestStatus,
  computeQuantityRemaining,
  getMostRecentMedicationDispenseStatus,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { useProviders } from '../medication-dispense/medication-dispense.resource';
import styles from './action-buttons.scss';
import CloseActionButton from './prescription-actions/close-action-button.component';
import PauseActionButton from './prescription-actions/pause-action-button.component';
import DispenseActionButton from './prescription-actions/dispense-action-button.component';

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

  return (
    <div className={styles.actionBtns}>
      <DispenseActionButton
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        medicationRequestBundle={medicationRequestBundle}
        session={session}
        providers={providers}
        dispensable={dispensable}
        quantityRemaining={quantityRemaining}
      />
      <PauseActionButton
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        medicationRequestBundle={medicationRequestBundle}
        session={session}
        providers={providers}
        pauseable={pauseable}
      />

      <CloseActionButton
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        medicationRequestBundle={medicationRequestBundle}
        session={session}
        providers={providers}
        closeable={closeable}
      />
    </div>
  );
};

export default ActionButtons;
