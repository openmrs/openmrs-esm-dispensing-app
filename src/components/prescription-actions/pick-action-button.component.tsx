import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, type Session } from '@openmrs/esm-framework';
import { updateOrderFulfillerDetails } from '../../medication-request/medication-request.resource';
import { type MedicationRequestBundle, MedicationRequestFulfillerStatus } from '../../types';
import { markEncounterAsStale, revalidate } from '../../utils';

type PickActionButtonProps = {
  encounterUuid: string;
  medicationRequestBundle: MedicationRequestBundle;
  session: Session;
  pickable: boolean;
  disabled: boolean;
};

/**
 * Lab-style "Pick": the pharmacist takes the prescription, moving it from Ordered to Picked so
 * colleagues can see someone is working on it. Dispensing is only offered after this.
 */
const PickActionButton: React.FC<PickActionButtonProps> = ({
  encounterUuid,
  medicationRequestBundle,
  session,
  pickable,
  disabled,
}) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const [isPicking, setIsPicking] = useState(false);

  if (!pickable) {
    return null;
  }

  const handlePick = () => {
    setIsPicking(true);
    markEncounterAsStale(encounterUuid);
    updateOrderFulfillerDetails(
      medicationRequestBundle.request.id,
      MedicationRequestFulfillerStatus.in_progress,
      t('pickedBy', 'Picked by {{name}}', { name: session?.user?.person?.display ?? session?.user?.display }),
    )
      .then(() => {
        revalidate(mutate, encounterUuid);
        showSnackbar({ kind: 'success', title: t('prescriptionPicked', 'Prescription picked') });
      })
      .catch((error) => {
        showSnackbar({
          kind: 'error',
          title: t('errorPickingPrescription', 'Error picking prescription'),
          subtitle: error?.message,
        });
      })
      .finally(() => setIsPicking(false));
  };

  return (
    <Button kind="primary" onClick={handlePick} disabled={disabled || isPicking}>
      {t('pick', 'Pick')}
    </Button>
  );
};

export default PickActionButton;
