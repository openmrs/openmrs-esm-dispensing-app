import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormLabel, InlineLoading } from '@carbon/react';
import { ExtensionSlot, showNotification, showToast, useConfig, usePatient } from '@openmrs/esm-framework';
import { closeOverlay } from '../hooks/useOverlay';
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

interface DispenseFormProps {
  medicationDispense: MedicationDispense;
  medicationRequestBundle: MedicationRequestBundle;
  mode: 'enter' | 'edit';
  patientUuid?: string;
  encounterUuid: string;
  quantityRemaining: number;
}

const DispenseForm: React.FC<DispenseFormProps> = ({
  medicationDispense,
  medicationRequestBundle,
  mode,
  patientUuid,
  encounterUuid,
  quantityRemaining,
}) => {
  const { t } = useTranslation();
  const { patient, isLoading } = usePatient(patientUuid);
  const config = useConfig<PharmacyConfig>();

  // Keep track of inventory item
  const [inventoryItem, setInventoryItem] = useState<InventoryItem>();

  // Keep track of medication dispense payload
  const [medicationDispensePayload, setMedicationDispensePayload] = useState<MedicationDispense>();

  // whether or not the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit medication dispense form
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
                getUuidFromReference(
                  medicationDispensePayload.authorizingPrescription[0].reference, // assumes authorizing prescription exist
                ),
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
                showToast({
                  critical: true,
                  title: t('stockDispensed', 'Stock dispensed'),
                  kind: 'success',
                  description: t('stockDispensedSuccessfully', 'Stock dispensed successfully and batch level updated.'),
                });
              },
              (error) => {
                showToast({ title: 'Stock dispense error', kind: 'error', description: error?.message });
              },
            );
          }
          return response;
        })
        .then(
          ({ status }) => {
            if (status === 201 || status === 200) {
              closeOverlay();
              revalidate(encounterUuid);
              showToast({
                critical: true,
                kind: 'success',
                description: t('medicationListUpdated', 'Medication dispense list has been updated.'),
                title: t(
                  mode === 'enter' ? 'medicationDispensed' : 'medicationDispenseUpdated',
                  mode === 'enter' ? 'Medication successfully dispensed.' : 'Dispense record successfully updated.',
                ),
              });
            }
          },
          (error) => {
            showNotification({
              title: t(
                mode === 'enter' ? 'medicationDispenseError' : 'medicationDispenseUpdatedError',
                mode === 'enter' ? 'Error dispensing medication.' : 'Error updating dispense record',
              ),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
            setIsSubmitting(false);
          },
        );
    }
  };

  const checkIsValid = () => {
    if (
      medicationDispensePayload &&
      medicationDispensePayload.quantity?.value &&
      (!quantityRemaining || medicationDispensePayload?.quantity?.value <= quantityRemaining) &&
      medicationDispensePayload.quantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.route?.coding[0].code &&
      medicationDispensePayload.dosageInstruction[0]?.timing?.code.coding[0].code &&
      (!medicationDispensePayload.substitution.wasSubstituted ||
        (medicationDispensePayload.substitution.reason[0]?.coding[0].code &&
          medicationDispensePayload.substitution.type?.coding[0].code))
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  // initialize the internal dispense payload with the dispenses passed in as props
  useEffect(() => setMedicationDispensePayload(medicationDispense), [medicationDispense]);

  // check is valid on any changes
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
    <div>
      <div className={styles.formWrapper}>
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
        <section className={styles.buttonGroup}>
          <Button disabled={isSubmitting} onClick={() => closeOverlay()} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={isButtonDisabled} onClick={handleSubmit}>
            {t(
              mode === 'enter' ? 'dispensePrescription' : 'saveChanges',
              mode === 'enter' ? 'Dispense prescription' : 'Save changes',
            )}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default DispenseForm;
