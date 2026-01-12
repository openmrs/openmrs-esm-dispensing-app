import React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader, Tile } from '@carbon/react';
import { Trans, useTranslation } from 'react-i18next';
import { getPatientName, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import {
  updateMedicationRequestFulfillerStatus,
  usePrescriptionDetails,
} from '../medication-request/medication-request.resource';
import {
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getUuidFromReference,
  markEncounterAsStale,
  revalidate,
} from '../utils';
import {
  initiateMedicationDispenseBody,
  saveMedicationDispense,
  useProviders,
} from '../medication-dispense/medication-dispense.resource';
import { type PharmacyConfig } from '../config-schema';
import MedicationEvent from '../components/medication-event.component';
import { MedicationDispenseStatus, MedicationRequestFulfillerStatus } from '../types';
import styles from './on-prescription-filled.scss';

interface OnPrescriptionFilledModalProps {
  patient: fhir.Patient;

  /**
   * The encounter with which the user just placed the fill prescription order.
   */
  encounterUuid: string;

  /**
   * closes the modal
   */
  close(): void;
}

/**
 * This modal appears after the user submits the order basket opened via the
 * "Fill Prescription" button in the dispensing app. It confirms whether the user
 * would like to immediately mark the medication orders as dispensed.
 */
const OnPrescriptionFilledModal: React.FC<OnPrescriptionFilledModalProps> = ({ patient, encounterUuid, close }) => {
  const { dispenserProviderRoles } = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(dispenserProviderRoles);
  const { medicationRequestBundles } = usePrescriptionDetails(encounterUuid);
  const { t } = useTranslation();

  const onConfirm = async () => {
    markEncounterAsStale(encounterUuid);
    for (const medicationRequestBundle of medicationRequestBundles) {
      const medicationDispensePayload = initiateMedicationDispenseBody(
        medicationRequestBundle.request,
        session,
        providers,
        true,
      );
      const medicationDisplay = getMedicationDisplay(
        getMedicationReferenceOrCodeableConcept(medicationRequestBundle.request),
      );

      await saveMedicationDispense(medicationDispensePayload, MedicationDispenseStatus.completed)
        .then((response) => {
          const hasNoRefills = medicationRequestBundle.request.dispenseRequest.numberOfRepeatsAllowed == 0;
          if (response.ok && hasNoRefills) {
            return updateMedicationRequestFulfillerStatus(
              getUuidFromReference(
                medicationDispensePayload.authorizingPrescription[0].reference, // assumes authorizing prescription exist
              ),
              MedicationRequestFulfillerStatus.completed,
            ).then(() => response);
          } else {
            return response;
          }
        })
        .then(() => {
          showSnackbar({
            title: t('stockDispensed', 'Stock dispensed'),
            subtitle: medicationDisplay,
            isLowContrast: false,
          });
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorDispensingMedication', 'Error dispensing medication'),
            kind: 'error',
            subtitle: t('errorDispensingMedicationMessage', '{{medication}}: {{error}}', {
              medication: medicationDisplay,
              error: error?.message,
            }),
          });
        });
    }
    close();
    revalidate(encounterUuid);
  };

  const patientName = getPatientName(patient);

  return (
    <>
      <ModalHeader>{t('dispenseAllPrescriptions', 'Dispense prescriptions')}</ModalHeader>
      <ModalBody>
        <p className={styles.modalDescription}>
          <Trans i18nKey="confirmRemovePatientFromQueue">
            Would you like to mark prescriptions ordered for <strong>{{ patientName } as any}</strong> as dispensed?
            Orders with no refills will be marked as completed.
          </Trans>
        </p>
        {medicationRequestBundles.map((bundle) => (
          <Tile className={styles.prescriptionTile}>
            <MedicationEvent key={bundle.request.id} medicationEvent={bundle.request} />
          </Tile>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
          }}>
          {t('dispenseAllPrescriptions', 'Dispense all prescriptions')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default OnPrescriptionFilledModal;
