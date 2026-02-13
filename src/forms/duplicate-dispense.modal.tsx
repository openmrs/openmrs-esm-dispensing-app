import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading, Tile, Tag } from '@carbon/react';
import type { MedicationDispense } from '../types';
import MedicationEvent from '../components/medication-event.component';

interface DuplicateDispenseModalProps {
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  medicationName?: string;
  previousDispenseDate?: string;
  previousQuantity?: number;
  previousQuantityUnit?: string;
  previousPerformer?: string;
  previousRoute?: string;
  previousSchedule?: string;
  previousDispense?: MedicationDispense;
}

const DuplicateDispenseModal: React.FC<DuplicateDispenseModalProps> = ({
  onClose,
  onConfirm,
  title,
  message,
  medicationName,
  previousDispenseDate,
  previousQuantity,
  previousQuantityUnit,
  previousPerformer,
  previousRoute,
  previousSchedule,
  previousDispense,
}) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error during dispensing:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm, onClose]);

  const modalTitle = title ?? t('duplicatePrescriptionTitle', 'Potential duplicate dispense detected');
  const modalMessage =
    message ??
    t(
      'duplicatePrescriptionMessage',
      'This dispense appears to match a previous record for the same prescription (medication, dose, quantity, and schedule).',
    );

  return (
    <>
      <ModalHeader title={modalTitle} closeModal={onClose} />
      <ModalBody>
        <p>{modalMessage}</p>

        {medicationName && (
          <p>
            {t('medication', 'Medication')}: <strong>{medicationName}</strong>
          </p>
        )}

        {previousDispense ? (
          <Tile>
            <div style={{ marginBottom: '0.5rem' }}>
              <Tag type="gray" size="sm">
                {t('dispensed', 'Dispensed')}
              </Tag>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#6f6f6f', marginBottom: '0.5rem' }}>
              {previousPerformer && (
                <span>
                  {t('performedBy', 'Performed by')}: <strong>{previousPerformer}</strong>
                </span>
              )}
              {previousPerformer && previousDispenseDate && <span style={{ margin: '0 0.25rem' }}>•</span>}
              {previousDispenseDate && <span>{new Date(previousDispenseDate).toLocaleDateString()}</span>}
            </div>

            <MedicationEvent medicationEvent={previousDispense} />
          </Tile>
        ) : (
          <>
            {previousDispenseDate && previousQuantity !== undefined && (
              <p>
                {t('previousDispenseDetails', 'Previous dispense on')}{' '}
                <strong>{new Date(previousDispenseDate).toLocaleDateString()}</strong>{' '}
                {t('withQuantity', 'with quantity')}{' '}
                <strong>
                  {previousQuantity}
                  {previousQuantityUnit ? ` ${previousQuantityUnit}` : ''}
                </strong>
                .
              </p>
            )}

            {previousPerformer && (
              <p>
                {t('performedBy', 'Performed by')}: <strong>{previousPerformer}</strong>
              </p>
            )}

            {previousRoute && (
              <p>
                {t('route', 'Route')}: <strong>{previousRoute}</strong>
              </p>
            )}

            {previousSchedule && (
              <p>
                {t('schedule', 'Schedule')}: <strong>{previousSchedule}</strong>
              </p>
            )}
          </>
        )}

        <p>
          {t(
            'duplicateDispenseConfirmationPrompt',
            'Do you want to proceed with dispensing? Proceeding will create another dispense record.',
          )}
        </p>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isProcessing}>
          {t('cancel', 'Cancel')}
        </Button>

        <Button kind="danger" onClick={() => void handleConfirm()} disabled={isProcessing}>
          {isProcessing ? (
            <InlineLoading description={t('dispensing', 'Dispensing')} />
          ) : (
            t('proceedAnyway', 'Proceed anyway')
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DuplicateDispenseModal;
