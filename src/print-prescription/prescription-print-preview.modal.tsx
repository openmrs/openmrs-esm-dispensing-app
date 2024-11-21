import {
  Button,
  ButtonSet,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { usePrescriptionDetails } from '../medication-request/medication-request.resource';
import PrescriptionsPrintout from './prescription-printout.component';
import styles from './print-prescription.scss';

type PrescriptionPrintPreviewModalProps = {
  onClose: () => void;
  encounterUuid: string;
  patientUuid: string;
  status: string;
};

const PrescriptionPrintPreviewModal: React.FC<PrescriptionPrintPreviewModalProps> = ({
  onClose,
  encounterUuid,
  patientUuid,
  status,
}) => {
  const { t } = useTranslation();
  const { medicationRequestBundles, isError, isLoading } = usePrescriptionDetails(encounterUuid);
  const componentRef = useRef<HTMLDivElement>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      setPrintError(null);
    },
    onPrintError: (error) => {
      setPrintError(t('printError', 'An error occurred while printing. Please try again.'));
    },
    copyStyles: true,
  });

  return (
    <>
      <ModalHeader closeModal={onClose} className={styles.title}>
        {t('printPrescriptions', 'Print Prescriptions')}
      </ModalHeader>
      <ModalBody>
        {isLoading && (
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('loading', 'Loading prescriptions') + '....'}
          />
        )}
        {isError && <ErrorState error={isError} headerTitle={t('error', 'Error')} />}
        {!isLoading && medicationRequestBundles?.length > 0 && (
          <div ref={componentRef}>
            <PrescriptionsPrintout medicationrequests={medicationRequestBundles} />
          </div>
        )}
        {printError && (
          <InlineNotification kind="error" title={t('printErrorTitle', 'Print Error')} subtitle={printError} />
        )}
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.btnSet}>
          <Button kind="secondary" onClick={onClose} type="button">
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" onClick={handlePrint} type="button" disabled={isLoading}>
            {t('print', 'Print')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </>
  );
};

export default PrescriptionPrintPreviewModal;
