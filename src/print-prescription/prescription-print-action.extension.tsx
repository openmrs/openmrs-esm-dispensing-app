import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showModal, useConfig } from '@openmrs/esm-framework';
import type { PharmacyConfig } from '../config-schema';

type PrescriptionPrintActionProps = {
  encounterUuid: string;
  patientUuid: string;
};

const PrescriptionPrintAction: React.FC<PrescriptionPrintActionProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();

  const handleClick = useCallback(() => {
    const dispose = showModal('prescription-print-preview-modal', {
      onClose: () => dispose(),
      encounterUuid,
      patientUuid,
    });
  }, [encounterUuid, patientUuid]);

  if (!config.actionButtons.printPrescriptionsButton.enabled) {
    return null;
  }

  return (
    <Button renderIcon={Printer} iconDescription={t('print', 'Print')} onClick={handleClick} kind="ghost">
      {t('printPrescriptions', 'Print prescriptions')}
    </Button>
  );
};

export default PrescriptionPrintAction;
