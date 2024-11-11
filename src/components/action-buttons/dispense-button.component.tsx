import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@openmrs/esm-framework';
import { type MedicationRequestBundle } from '../../types';
import { launchOverlay } from '../../hooks/useOverlay';
import { initiateMedicationDispenseBody, useProviders } from '../../medication-dispense/medication-dispense.resource';
import DispenseForm from '../../forms/dispense-form.component';

interface DispenseButtonProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
  dispensable: boolean;
  quantityRemaining: number | null;
  config: any;
}

export const DispenseButton: React.FC<DispenseButtonProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
  dispensable,
  quantityRemaining,
  config,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);

  if (!dispensable) return null;

  return (
    <Button
      kind="primary"
      onClick={() =>
        launchOverlay(
          t('dispensePrescription', 'Dispense prescription'),
          <DispenseForm
            patientUuid={patientUuid}
            encounterUuid={encounterUuid}
            medicationDispense={initiateMedicationDispenseBody(
              medicationRequestBundle.request,
              session,
              providers,
              true,
            )}
            medicationRequestBundle={medicationRequestBundle}
            quantityRemaining={quantityRemaining}
            mode="enter"
          />,
        )
      }>
      {t('dispense', 'Dispense')}
    </Button>
  );
};
