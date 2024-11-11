import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@openmrs/esm-framework';
import { launchOverlay } from '../../hooks/useOverlay';
import { initiateMedicationDispenseBody, useProviders } from '../../medication-dispense/medication-dispense.resource';
import PauseDispenseForm from '../../forms/pause-dispense-form.component';
import { type MedicationRequestBundle } from '../../types';

interface PauseButtonProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
  pauseable: boolean;
  config: any;
}

export const PauseButton: React.FC<PauseButtonProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
  pauseable,
  config,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);

  if (!pauseable) return null;

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
