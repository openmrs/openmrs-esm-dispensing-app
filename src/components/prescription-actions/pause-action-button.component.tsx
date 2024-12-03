import React from 'react';
import { Button } from '@carbon/react';
import { launchOverlay } from '../../hooks/useOverlay';
import { useTranslation } from 'react-i18next';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle } from '../../types';
import { type Session } from '@openmrs/esm-framework';
import PauseDispenseForm from '../../forms/pause-dispense-form.component';

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
  if (!pauseable) {
    return null;
  }
  return (
    <Button
      kind="secondary"
      onClick={() =>
        launchOverlay(
          t('pausePrescription', 'Pause prescription'),
          <PauseDispenseForm
            patientUuid={patientUuid}
            encounterUuid={encounterUuid}
            medicationDispense={initiateMedicationDispenseBody(
              medicationRequestBundle.request,
              session,
              providers,
              false,
            )}
            mode="enter"
          />,
        )
      }>
      {t('pause', 'Pause')}
    </Button>
  );
};

export default PauseActionButton;
