import React from 'react';
import { Button } from '@carbon/react';
import { launchOverlay } from '../../hooks/useOverlay';
import { useTranslation } from 'react-i18next';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle } from '../../types';
import { type Session } from '@openmrs/esm-framework';
import DispenseForm from '../../forms/dispense-form.component';

type DispenseActionButtonProps = {
  patientUuid: string;
  encounterUuid: string;
  medicationRequestBundle: MedicationRequestBundle;
  session: Session;
  providers: Array<Provider>;
  dispensable: boolean;
  quantityRemaining: number;
};

const DispenseActionButton: React.FC<DispenseActionButtonProps> = ({
  patientUuid,
  encounterUuid,
  medicationRequestBundle,
  session,
  providers,
  dispensable,
  quantityRemaining,
}) => {
  const { t } = useTranslation();
  if (!dispensable) {
    return null;
  }
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

export default DispenseActionButton;
