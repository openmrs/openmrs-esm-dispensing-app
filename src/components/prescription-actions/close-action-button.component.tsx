import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, type Session } from '@openmrs/esm-framework';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle } from '../../types';

type CloseActionButtonProps = {
  patientUuid: string;
  encounterUuid: string;
  medicationRequestBundle: MedicationRequestBundle;
  session: Session;
  providers: Array<Provider>;
  closeable: boolean;
};

const CloseActionButton: React.FC<CloseActionButtonProps> = ({
  patientUuid,
  encounterUuid,
  medicationRequestBundle,
  session,
  providers,
  closeable,
}) => {
  const { t } = useTranslation();

  const closeDispenseFormProps = {
    patientUuid,
    encounterUuid,
    medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, false),
    mode: 'enter',
  };

  const handleLaunchWorkspace = () => {
    launchWorkspace('close-dispense-workspace', closeDispenseFormProps);
  };

  if (!closeable) {
    return null;
  }
  return (
    <Button kind="danger" onClick={handleLaunchWorkspace}>
      {t('close', 'Close')}
    </Button>
  );
};

export default CloseActionButton;
