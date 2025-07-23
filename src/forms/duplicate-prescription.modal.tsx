import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading } from '@carbon/react';

interface DuplicatePrescriptionModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
  previousDispenseDate?: string;
  previousQuantity?: number;
}

const DuplicatePrescriptionModal: React.FC<DuplicatePrescriptionModalProps> = ({
  onClose,
  onConfirm,
  title,
  message,
  previousDispenseDate,
  previousQuantity,
}) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('dispenseSuccess', 'Dispensing completed successfully'),
      });
      onClose();
    } catch (error) {
      console.error('Error during dispensing:', error);
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDispensing', 'Error during dispensing'),
        subtitle: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm, t, onClose]);

  const modalTitle = title ?? t('duplicatePrescriptionTitle', 'Duplicate Dispensing Detected');
  const modalMessage =
    message ??
    t(
      'duplicatePrescriptionMessage',
      'An identical medication (same dose, quantity, and duration) appears to have already been dispensed.',
    );

  return (
    <>
      <ModalHeader closeModal={onClose} title={modalTitle} />
      <ModalBody>
        <p>{modalMessage}</p>
        {previousDispenseDate && previousQuantity !== undefined && (
          <p>
            {t('previousDispenseDetails', 'Previous dispense on')}{' '}
            <strong>{new Date(previousDispenseDate).toLocaleDateString()}</strong> {t('withQuantity', 'with quantity')}{' '}
            <strong>{previousQuantity}</strong>.
          </p>
        )}
        <p>{t('confirmationPrompt', 'Do you want to proceed with dispensing?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isProcessing}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={() => void handleConfirm()} disabled={isProcessing}>
          {isProcessing ? (
            <InlineLoading description={`${t('dispensing', 'Dispensing')}...`} />
          ) : (
            <span>{t('dispense', 'Dispense')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DuplicatePrescriptionModal;
