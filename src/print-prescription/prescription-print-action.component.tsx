import React from 'react';
import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';

type PrescriptionPrintActionProps = {
  encounterUuid: string;
  patientUuid: string;
};

const PrescriptionPrintAction: React.FC<PrescriptionPrintActionProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();

  return (
    <Button
      renderIcon={Printer}
      iconDescription={t('print', 'Print')}
      onClick={() => {
        const dispose = showModal('prescription-print-preview-modal', {
          onClose: () => dispose(),
          encounterUuid,
          patientUuid,
        });
      }}
      kind="ghost">
      {t('printPrescriptions', 'Print prescriptions')}
    </Button>
  );
};

export default PrescriptionPrintAction;
