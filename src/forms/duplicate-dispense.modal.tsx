import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading, Tile, Tag } from '@carbon/react';
import type { MedicationDispense } from '../types';
import MedicationEvent from '../components/medication-event.component';
import styles from './duplicate-dispense-modal.scss';

interface DuplicateDispenseModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) {
      // fall back to raw string if it's not a valid date; alternatively return ''
      return dateString;
    }
    return d.toLocaleDateString();
  };

  const handleConfirm = useCallback(async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // Log for debugging and show user-friendly message
      console.error('Error during dispensing:', err);
      setError(t('duplicateDispenseError'));
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [onConfirm, onClose, t]);

  const modalTitle = title ?? t('duplicatePrescriptionTitle', 'Potential duplicate dispense detected');

  const modalMessage = message ?? (!previousDispense ? t('duplicatePrescriptionMessageNoPrevious') : '');

  return (
    <>
      <ModalHeader title={modalTitle} closeModal={onClose} />

      <ModalBody>
        {!previousDispense && modalMessage && <p>{modalMessage}</p>}

        {medicationName && !previousDispense && (
          <div className={styles.headerRow}>
            <span>{t('medication')}</span>
            <span className={styles.medicationName}>{medicationName}</span>
          </div>
        )}

        {previousDispense ? (
          <Tile className={styles.previousDispenseTile}>
            <div className={styles.headerRow}>
              <Tag type="gray" size="sm">
                {t('dispensed')}
              </Tag>
              {medicationName && <span className={styles.medicationName}>{medicationName}</span>}
            </div>

            <div className={styles.metaRow}>
              {previousPerformer && (
                <span>
                  {t('performedBy')}: <strong>{previousPerformer}</strong>
                </span>
              )}

              {previousPerformer && previousDispenseDate && <span className={styles.metaDivider}>•</span>}

              {previousDispenseDate && <span>{formatDateSafe(previousDispenseDate)}</span>}
            </div>

            <div className={styles.tileContent}>
              <MedicationEvent medicationEvent={previousDispense} />
            </div>
          </Tile>
        ) : (
          <>
            {previousDispenseDate && previousQuantity !== undefined && (
              <p>
                {t('previousDispenseDetails')} <strong>{formatDateSafe(previousDispenseDate)}</strong>{' '}
                {t('withQuantity')}{' '}
                <strong>
                  {previousQuantity}
                  {previousQuantityUnit ? ` ${previousQuantityUnit}` : ''}
                </strong>
                .
              </p>
            )}

            {previousPerformer && (
              <p>
                {t('performedBy')}: <strong>{previousPerformer}</strong>
              </p>
            )}

            {previousRoute && (
              <p>
                {t('route')}: <strong>{previousRoute}</strong>
              </p>
            )}

            {previousSchedule && (
              <p>
                {t('schedule')}: <strong>{previousSchedule}</strong>
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

        {error && <p className={styles.error}>{error}</p>}
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isProcessing}>
          {t('cancel')}
        </Button>

        <Button kind="danger" onClick={() => void handleConfirm()} disabled={isProcessing} aria-disabled={isProcessing}>
          {isProcessing ? <InlineLoading description={t('dispensing')} /> : t('proceedAnyway')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DuplicateDispenseModal;
