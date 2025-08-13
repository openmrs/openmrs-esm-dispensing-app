import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormLabel, InlineLoading } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  getCoreTranslation,
  showModal,
  showSnackbar,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import {
  type MedicationDispense,
  MedicationDispenseStatus,
  type MedicationRequestBundle,
  type InventoryItem,
} from '../types';
import {
  computeNewFulfillerStatusAfterDispenseEvent,
  getFulfillerStatus,
  getUuidFromReference,
  revalidate,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { createStockDispenseRequestPayload, sendStockDispenseRequest } from './stock-dispense/stock.resource';
import { saveMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import { updateMedicationRequestFulfillerStatus } from '../medication-request/medication-request.resource';
import MedicationDispenseReview from './medication-dispense-review.component';
import StockDispense from './stock-dispense/stock-dispense.component';
import styles from './forms.scss';

type DispenseFormProps = DefaultWorkspaceProps & {
  medicationDispense: MedicationDispense;
  medicationRequestBundle: MedicationRequestBundle;
  mode: 'enter' | 'edit';
  patientUuid?: string;
  encounterUuid: string;
  quantityRemaining: number;
  quantityDispensed: number;
};

const DispenseForm: React.FC<DispenseFormProps> = ({
  medicationDispense,
  medicationRequestBundle,
  mode,
  patientUuid,
  encounterUuid,
  quantityRemaining,
  quantityDispensed,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  const { t } = useTranslation();
  const { patient, isLoading } = usePatient(patientUuid);
  const config = useConfig<PharmacyConfig>();

  const [inventoryItem, setInventoryItem] = useState<InventoryItem>();
  const [medicationDispensePayload, setMedicationDispensePayload] = useState<MedicationDispense>();
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDuplicateMedication = (dispense: MedicationDispense): boolean => {
    const dispenses = medicationRequestBundle?.dispenses ?? [];

    return dispenses.some((existingDispense) => {
      return (
        existingDispense.medicationCodeableConcept?.coding?.[0]?.code ===
          dispense.medicationCodeableConcept?.coding?.[0]?.code &&
        existingDispense.performer?.[0]?.actor?.reference === dispense.performer?.[0]?.actor?.reference &&
        existingDispense.quantity?.value === dispense.quantity?.value &&
        existingDispense.quantity?.code === dispense.quantity?.code &&
        existingDispense.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value ===
          dispense.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value &&
        existingDispense.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.code ===
          dispense.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.code &&
        existingDispense.dosageInstruction?.[0]?.route?.coding?.[0]?.code ===
          dispense.dosageInstruction?.[0]?.route?.coding?.[0]?.code &&
        existingDispense.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code ===
          dispense.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code
      );
    });
  };

  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();

      saveMedicationDispense(medicationDispensePayload, MedicationDispenseStatus.completed, abortController)
        .then((response) => {
          if (response.ok) {
            const newFulfillerStatus = computeNewFulfillerStatusAfterDispenseEvent(
              medicationDispensePayload,
              medicationRequestBundle,
              config.dispenseBehavior.restrictTotalQuantityDispensed,
            );
            if (getFulfillerStatus(medicationRequestBundle.request) !== newFulfillerStatus) {
              return updateMedicationRequestFulfillerStatus(
                getUuidFromReference(medicationDispensePayload.authorizingPrescription[0].reference),
                newFulfillerStatus,
              );
            }
          }
          return response;
        })
        .then((response) => {
          const { status } = response;
          if (config.enableStockDispense && (status === 201 || status === 200)) {
            const stockDispenseRequestPayload = createStockDispenseRequestPayload(
              inventoryItem,
              patientUuid,
              encounterUuid,
              medicationDispensePayload,
            );
            sendStockDispenseRequest(stockDispenseRequestPayload, abortController).then(
              () => {
                showSnackbar({
                  title: t('stockDispensed', 'Stock dispensed'),
                  kind: 'success',
                  subtitle: t('stockDispensedSuccessfully', 'Stock dispensed successfully and batch level updated.'),
                });
              },
              (error) => {
                showSnackbar({
                  title: 'Stock dispense error',
                  kind: 'error',
                  subtitle: error?.message,
                });
              },
            );
          }
          return response;
        })
        .then(
          ({ status }) => {
            if (status === 201 || status === 200) {
              revalidate(encounterUuid);
              showSnackbar({
                kind: 'success',
                subtitle: t('medicationListUpdated', 'Medication dispense list has been updated.'),
                title: t(
                  mode === 'enter' ? 'medicationDispensed' : 'medicationDispenseUpdated',
                  mode === 'enter' ? 'Medication successfully dispensed.' : 'Dispense record successfully updated.',
                ),
              });
              closeWorkspaceWithSavedChanges();
            }
          },
          (error) => {
            showSnackbar({
              kind: 'error',
              title: t(
                mode === 'enter' ? 'medicationDispenseError' : 'medicationDispenseUpdatedError',
                mode === 'enter' ? 'Error dispensing medication.' : 'Error updating dispense record',
              ),
              subtitle: error?.message,
            });
            setIsSubmitting(false);
          },
        );
    }
  };

  const handleDuplicateMedication = () => {
    const dispose = showModal('duplicate-prescription-modal', {
      onClose: () => dispose(),
      medicationName: medicationDispensePayload?.medicationCodeableConcept?.text || '',
      onConfirm: () => {
        handleSubmit();
      },
    });
  };

  const checkIsValid = () => {
    if (
      medicationDispensePayload &&
      medicationDispensePayload.performer &&
      medicationDispensePayload.performer[0]?.actor.reference &&
      medicationDispensePayload.quantity?.value &&
      (!quantityRemaining || medicationDispensePayload?.quantity?.value <= quantityRemaining) &&
      medicationDispensePayload.quantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.route?.coding[0].code &&
      medicationDispensePayload.dosageInstruction[0]?.timing?.code.coding[0].code &&
      (!medicationDispensePayload.substitution?.wasSubstituted ||
        (medicationDispensePayload.substitution.reason?.[0]?.coding?.[0]?.code &&
          medicationDispensePayload.substitution.type?.coding?.[0]?.code))
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => setMedicationDispensePayload(medicationDispense), [medicationDispense]);
  useEffect(checkIsValid, [medicationDispensePayload, quantityRemaining, inventoryItem]);

  const isButtonDisabled = (config.enableStockDispense ? !inventoryItem : false) || !isValid || isSubmitting;

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
          <FormLabel>
            {t(
              config.dispenseBehavior.allowModifyingPrescription ? 'drugHelpText' : 'drugHelpTextNoEdit',
              config.dispenseBehavior.allowModifyingPrescription
                ? 'You may edit the formulation and quantity dispensed here'
                : 'You may edit quantity dispensed here',
            )}
          </FormLabel>
          {medicationDispensePayload ? (
            <div>
              <MedicationDispenseReview
                medicationDispense={medicationDispensePayload}
                updateMedicationDispense={setMedicationDispensePayload}
                quantityRemaining={quantityRemaining}
                quantityDispensed={quantityDispensed}
              />
              {config.enableStockDispense && (
                <StockDispense
                  inventoryItem={inventoryItem}
                  medicationDispense={medicationDispense}
                  updateInventoryItem={setInventoryItem}
                />
              )}
            </div>
          ) : null}
        </section>
      </div>
      <section className={styles.buttonGroup}>
        <Button disabled={isSubmitting} onClick={() => closeWorkspace()} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={isButtonDisabled}
          onClick={() => {
            if (medicationDispensePayload && isDuplicateMedication(medicationDispensePayload)) {
              handleDuplicateMedication();
            } else {
              handleSubmit();
            }
          }}>
          {t(
            mode === 'enter' ? 'dispensePrescription' : 'saveChanges',
            mode === 'enter' ? 'Dispense prescription' : 'Save changes',
          )}
        </Button>
      </section>
    </Form>
  );
};

export default DispenseForm;
