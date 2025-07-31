import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormLabel, InlineLoading } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  getCoreTranslation,
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
import DuplicatePrescriptionModal from './duplicate-prescription.modal';

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

  // State to control modal open/close
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [previousDispenseDetails, setPreviousDispenseDetails] = useState<{
    date: string;
    quantity: number;
  } | null>(null);

  // Check if a duplicate dispense exists
  const checkDuplicateDispense = (): boolean => {
    const pastDispenses = medicationRequestBundle?.dispenses || [];
    const current = medicationDispensePayload;

    return pastDispenses.some((dispense) => {
      const currentDose = current?.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value ?? undefined;
      const currentQty = current?.quantity?.value ?? undefined;
      const currentTiming = current?.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code ?? undefined;

      const prevDose = dispense.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value ?? undefined;
      const prevQty = dispense.quantity?.value ?? undefined;
      const prevTiming = dispense.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code ?? undefined;

      const isSame = currentDose === prevDose && currentQty === prevQty && currentTiming === prevTiming;

      if (isSame) {
        setPreviousDispenseDetails({
          date: dispense.whenHandedOver ?? '',
          quantity: dispense.quantity?.value ?? 0,
        });
      }

      return isSame;
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isSubmitting) {
      const isDuplicate = checkDuplicateDispense();
      if (isDuplicate) {
        setIsDuplicateModalOpen(true); // Show modal if duplicate
        return;
      }

      proceedWithDispense();
    }
  };

  // Called when modal confirms dispensing despite duplicate
  const proceedWithDispense = () => {
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
  };

  const checkIsValid = () => {
    const valid =
      medicationDispensePayload &&
      medicationDispensePayload.performer?.[0]?.actor?.reference &&
      medicationDispensePayload.quantity?.value &&
      (!quantityRemaining || medicationDispensePayload?.quantity?.value <= quantityRemaining) &&
      medicationDispensePayload.quantity?.code &&
      medicationDispensePayload.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value &&
      medicationDispensePayload.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.code &&
      medicationDispensePayload.dosageInstruction?.[0]?.route?.coding?.[0]?.code &&
      medicationDispensePayload.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code &&
      (!medicationDispensePayload.substitution?.wasSubstituted ||
        (medicationDispensePayload.substitution.reason?.[0]?.coding?.[0]?.code &&
          medicationDispensePayload.substitution.type?.coding?.[0]?.code));

    setIsValid(!!valid);
  };

  useEffect(() => setMedicationDispensePayload(medicationDispense), [medicationDispense]);
  useEffect(checkIsValid, [medicationDispensePayload, quantityRemaining, inventoryItem]);

  const isButtonDisabled = (config.enableStockDispense ? !inventoryItem : false) || !isValid || isSubmitting;

  const bannerState = useMemo(() => {
    return patient
      ? {
          patient,
          patientUuid,
          hideActionsOverflow: true,
        }
      : undefined;
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
          {medicationDispensePayload && (
            <>
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
            </>
          )}
        </section>
      </div>
      <section className={styles.buttonGroup}>
        <Button disabled={isSubmitting} onClick={() => closeWorkspace()} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={isButtonDisabled} onClick={handleSubmit}>
          {t(
            mode === 'enter' ? 'dispensePrescription' : 'saveChanges',
            mode === 'enter' ? 'Dispense prescription' : 'Save changes',
          )}
        </Button>
      </section>

      <DuplicatePrescriptionModal
        open={isDuplicateModalOpen}
        onCancel={() => setIsDuplicateModalOpen(false)}
        onConfirm={() => {
          setIsDuplicateModalOpen(false);
          proceedWithDispense();
        }}
        previousDispenseDate={previousDispenseDetails?.date}
        previousQuantity={previousDispenseDetails?.quantity}
        title={t('duplicateDispenseWarning', 'Duplicate Dispense Warning')}
        message={t(
          'duplicateDispenseMessage',
          `A similar dispense record exists from ${previousDispenseDetails?.date} with quantity ${previousDispenseDetails?.quantity}. Are you sure you want to proceed?`,
        )}
      />
    </Form>
  );
};

export default DispenseForm;
