import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ComboBox, Form, InlineLoading } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  getCoreTranslation,
  ResponsiveWrapper,
  showSnackbar,
  useConfig,
  useLayoutType,
  usePatient,
} from '@openmrs/esm-framework';
import { saveMedicationDispense, useReasonForCloseValueSet } from '../medication-dispense/medication-dispense.resource';
import { updateMedicationRequestFulfillerStatus } from '../medication-request/medication-request.resource';
import { type MedicationDispense, MedicationDispenseStatus, MedicationRequestFulfillerStatus } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { getUuidFromReference, revalidate } from '../utils';
import styles from './forms.scss';

type CloseDispenseFormProps = DefaultWorkspaceProps & {
  medicationDispense: MedicationDispense;
  mode: 'enter' | 'edit';
  patientUuid?: string;
  encounterUuid: string;
};

const CloseDispenseForm: React.FC<CloseDispenseFormProps> = ({
  medicationDispense,
  mode,
  patientUuid,
  encounterUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const isTablet = useLayoutType() === 'tablet';
  const { patient, isLoading } = usePatient(patientUuid);

  // Keep track of medication dispense payload
  const [medicationDispensePayload, setMedicationDispensePayload] = useState<MedicationDispense>();

  // whether or not the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonsForClose, setReasonsForClose] = useState([]);
  const { reasonForCloseValueSet } = useReasonForCloseValueSet(config.valueSets.reasonForClose.uuid);

  useEffect(() => {
    const reasonForCloseOptions = [];

    if (reasonForCloseValueSet?.compose?.include) {
      const uuidValueSet = reasonForCloseValueSet.compose.include.find((include) => !include.system);
      if (uuidValueSet) {
        uuidValueSet.concept?.forEach((concept) =>
          reasonForCloseOptions.push({
            id: concept.code,
            text: concept.display,
          }),
        );
        reasonForCloseOptions.sort((a, b) => a.text.localeCompare(b.text));
      }
    }
    setReasonsForClose(reasonForCloseOptions);
  }, [reasonForCloseValueSet]);

  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      saveMedicationDispense(medicationDispensePayload, MedicationDispenseStatus.declined, abortController)
        .then((response) => {
          // only update request status when added a new dispense event, not updating
          if (response.ok && !medicationDispense.id) {
            return updateMedicationRequestFulfillerStatus(
              getUuidFromReference(
                medicationDispensePayload.authorizingPrescription[0].reference, // assumes authorizing prescription exist
              ),
              MedicationRequestFulfillerStatus.declined,
            );
          } else {
            return response;
          }
        })
        .then((response) => {
          if (response.ok) {
            revalidate(encounterUuid);
            showSnackbar({
              kind: 'success',
              title: t(
                mode === 'enter' ? 'medicationDispenseClosed' : 'medicationDispenseUpdated',
                mode === 'enter' ? 'Medication dispense closed.' : 'Dispense record successfully updated.',
              ),
            });
            closeWorkspaceWithSavedChanges();
          }
        })
        .catch((error) => {
          showSnackbar({
            title: t(
              mode === 'enter' ? 'medicationDispenseCloseError' : 'medicationDispenseUpdatedError',
              mode === 'enter' ? 'Error closing medication dispense.' : 'Error updating dispense record',
            ),
            kind: 'error',
            subtitle: error?.message,
          });
          setIsSubmitting(false);
        });
    }
  };

  const checkIsValid = () => {
    if (medicationDispensePayload && medicationDispensePayload.statusReasonCodeableConcept?.coding[0].code) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  // initialize the internal dispense payload with the dispenses passed in as props
  useEffect(() => setMedicationDispensePayload(medicationDispense), [medicationDispense]);

  // check is valid on any changes
  useEffect(checkIsValid, [medicationDispensePayload]);

  const bannerState = useMemo(() => {
    if (patient) {
      return {
        patient,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [patient, patientUuid]);

  return (
    <Form className={styles.formWrapper}>
      <div>
        {isLoading && (
          <InlineLoading
            className={styles.bannerLoading}
            iconDescription="Loading"
            description="Loading banner"
            status="active"
          />
        )}
        {patient && <ExtensionSlot name="patient-header-slot" state={bannerState} />}
        <section className={styles.formGroup}>
          <ResponsiveWrapper>
            <ComboBox
              id="reasonForPause"
              items={reasonsForClose}
              titleText={t('reasonForClose', 'Reason for close')}
              itemToString={(item) => item?.text}
              initialSelectedItem={{
                id: medicationDispense.statusReasonCodeableConcept?.coding[0]?.code,
                text: medicationDispense.statusReasonCodeableConcept?.text,
              }}
              onChange={({ selectedItem }) => {
                setMedicationDispensePayload({
                  ...medicationDispensePayload,
                  statusReasonCodeableConcept: {
                    coding: [
                      {
                        code: selectedItem?.id,
                      },
                    ],
                  },
                });
              }}
            />
          </ResponsiveWrapper>
        </section>
      </div>
      <section className={styles.buttonGroup}>
        <Button disabled={isSubmitting} onClick={() => closeWorkspace()} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={!isValid || isSubmitting} onClick={handleSubmit}>
          {t(mode === 'enter' ? 'close' : 'saveChanges', mode === 'enter' ? 'Close' : 'Save changes')}
        </Button>
      </section>
    </Form>
  );
};

export default CloseDispenseForm;
