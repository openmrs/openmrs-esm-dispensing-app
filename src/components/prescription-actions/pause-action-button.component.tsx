import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, type Session } from '@openmrs/esm-framework';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle } from '../../types';

type PauseActionButtonProps = {
  patientUuid: string;
  encounterUuid: string;
  medicationRequestBundle: MedicationRequestBundle;
  session: Session;
  providers: Array<Provider>;
  pauseable: boolean;
};

const PauseActionButton: React.FC<PauseActionButtonProps> = ({
  patientUuid,
  encounterUuid,
  medicationRequestBundle,
  session,
  providers,
  pauseable,
}) => {
  const { t } = useTranslation();
  const pauseWorkspaceProps = {
    patientUuid,
    encounterUuid,
    medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, false),
    mode: 'enter',
  };

  const handleLaunchWorkspace = () => {
    launchWorkspace('pause-dispense-workspace', pauseWorkspaceProps);
  };

  if (!pauseable) {
    return null;
  }
  return (
    <Button kind="secondary" onClick={handleLaunchWorkspace}>
      {t('pause', 'Pause')}
    </Button>
  );
};

export default PauseActionButton;
