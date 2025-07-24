import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';

interface DuplicatePrescriptionModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  previousDispenseDate?: string;
  previousQuantity?: number;
}

const DuplicatePrescriptionModal: React.FC<DuplicatePrescriptionModalProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  previousDispenseDate,
  previousQuantity,
}) => {
  const { t } = useTranslation();

  const modalTitle = title ?? t('duplicatePrescriptionTitle', 'Possible Duplicate Dispensing Detected');
  const modalMessage =
    message ??
    t(
      'duplicatePrescriptionMessage',
      'An identical medication (same dose, quantity, and duration) appears to have already been dispensed.',
    );

  return (
    <Modal open={open} onRequestClose={onCancel}>
      <ModalHeader closeModal={onCancel} title={modalTitle} />
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
        <Button kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onConfirm}>
          {t('dispensing', 'Dispensing')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DuplicatePrescriptionModal;
