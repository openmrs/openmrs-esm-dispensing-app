import React, { useMemo } from 'react';
import { ExtensionSlot, useConfig, useSession } from '@openmrs/esm-framework';
import { MedicationDispenseStatus, type MedicationRequestBundle, MedicationRequestStatus } from '../types';
import {
  computeMedicationRequestStatus,
  computeQuantityRemaining,
  getMostRecentMedicationDispenseStatus,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import styles from './action-buttons.scss';
import { launchOverlay } from '../hooks/useOverlay';
import DispenseForm from '../forms/dispense-form.component';
import { initiateMedicationDispenseBody, useProviders } from '../medication-dispense/medication-dispense.resource';
import { useTranslation } from 'react-i18next';

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

  const handleOpenDispenseForm = () => {
    launchOverlay(
      t('dispensePrescription', 'Dispense prescription'),
      <DispenseForm
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        medicationDispense={initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, true)}
        medicationRequestBundle={medicationRequestBundle}
        quantityRemaining={quantityRemaining}
        mode="enter"
      />,
    );
  };

  const state = useMemo(
    () => ({
      dispensable,
      pauseable,
      closeable,
      quantityRemaining,
      medicationRequestBundle,
      patientUuid,
      encounterUuid,
      config,
      handleOpenDispenseForm,
    }),
    [dispensable, pauseable, closeable, quantityRemaining, medicationRequestBundle, patientUuid, encounterUuid, config],
  );

  if (!dispensable && !pauseable && !closeable) {
    return null;
  }

  return <ExtensionSlot className={styles.actionBtns} name="dispense-action-button" state={state} />;
};

export default ActionButtons;
