import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle } from '../../types';
import { launchWorkspace, type Session } from '@openmrs/esm-framework';

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
  const pauseWorkspaceProps = {
    patientUuid: patientUuid,
    encounterUuid: encounterUuid,
    medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, false),
    mode: 'enter',
  };
  const { t } = useTranslation();
  if (!pauseable) {
    return null;
  }
  return (
    <Button kind="secondary" onClick={() => launchWorkspace('pause-dispense-workspace', pauseWorkspaceProps)}>
      {t('pause', 'Pause')}
    </Button>
  );
};

export default PauseActionButton;
