import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@openmrs/esm-framework';
import { launchOverlay } from '../../hooks/useOverlay';
import { initiateMedicationDispenseBody, useProviders } from '../../medication-dispense/medication-dispense.resource';
import CloseDispenseForm from '../../forms/close-dispense-form.component';
import { type MedicationRequestBundle } from '../../types';

interface CloseButtonProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
  closeable: boolean;
  config: any;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
  closeable,
  config,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);

  if (!closeable) return null;

  return (
    <Button
      kind="danger"
      onClick={() =>
        launchOverlay(
          t('closePrescription', 'Close prescription'),
          <CloseDispenseForm
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
      {t('close', 'Close')}
    </Button>
  );
};
