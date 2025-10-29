import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';

type LabelPrintActionProps = {
  encounterUuid: string;
};

const LabelPrintAction: React.FC<LabelPrintActionProps> = ({ encounterUuid }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    const dispose = showModal('label-print-preview-modal', {
      onClose: () => dispose(),
      encounterUuid,
    });
  }, [encounterUuid]);

  return (
    <Button renderIcon={Printer} iconDescription={t('print', 'Print')} onClick={handleClick} kind="ghost">
      {t('printLabel', 'Print label')}
    </Button>
  );
};

export default LabelPrintAction;
