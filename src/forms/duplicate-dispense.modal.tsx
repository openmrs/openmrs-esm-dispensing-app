import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, InlineLoading, Tile, Tag } from '@carbon/react';
import type { MedicationDispense } from '../types';
import MedicationEvent from '../components/medication-event.component';
import styles from './duplicate-dispense-modal.scss';
import { getCoreTranslation, parseDate, formatDatetime } from '@openmrs/esm-framework';

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
    try {
      const parsed = parseDate(dateString);
      if (!parsed || Number.isNaN(parsed.getTime())) {
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) {
          return dateString;
        }
        return d.toLocaleString();
      }
      return formatDatetime(parsed);
    } catch {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) {
        return dateString;
      }
      return d.toLocaleString();
    }
  };

  const handleConfirm = useCallback(async () => {
    setError(null);
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error during dispensing:', err);
      setError(t('duplicateDispenseError', 'Error dispensing medication'));
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [onConfirm, onClose, t]);

  const modalTitle = title ?? t('duplicatePrescriptionTitle', 'Potential duplicate dispense detected');

  const modalMessage =
    message ??
    (!previousDispense ? t('duplicatePrescriptionMessageNoPrevious', 'A previous dispense could not be found.') : '');

  return (
    <>
      <ModalHeader title={modalTitle} closeModal={onClose} />

      <ModalBody>
        {!previousDispense && modalMessage && <p>{modalMessage}</p>}

        {medicationName && !previousDispense && (
          <div className={styles.headerRow}>
            <span>{t('medication', 'Medication')}</span>
            <span className={styles.medicationName}>{medicationName}</span>
          </div>
        )}

        {previousDispense ? (
          <Tile className={styles.previousDispenseTile}>
            <div className={styles.headerRow}>
              <Tag type="gray" size="sm">
                {t('dispensed', 'Dispensed')}
              </Tag>
              {medicationName && <span className={styles.medicationName}>{medicationName}</span>}
            </div>

            <div className={styles.metaRow}>
              {previousPerformer && (
                <span>
                  {t('performedBy', 'Performed by')}: <strong>{previousPerformer}</strong>
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
                {t('previousDispenseDetails', 'Previous dispense on')}{' '}
                <strong>{formatDateSafe(previousDispenseDate)}</strong> {t('withQuantity', 'with quantity')}{' '}
                <strong>
                  {previousQuantity}
                  {previousQuantityUnit ? ` ${previousQuantityUnit}` : ''}
                </strong>
                .
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

        {error && <p className={styles.error}>{error}</p>}
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isProcessing}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>

        <Button
          kind="danger"
          onClick={() => void handleConfirm()}
          disabled={isProcessing}
          aria-disabled={isProcessing}
          aria-busy={isProcessing}>
          {isProcessing ? (
            <InlineLoading description={t('dispensing', 'Dispensing')} />
          ) : (
            t('proceedAnyway', 'Proceed Anyway')
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DuplicateDispenseModal;
