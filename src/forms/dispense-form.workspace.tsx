import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Form, FormLabel, InlineLoading } from '@carbon/react';
import {
  ExtensionSlot,
  getCoreTranslation,
  showSnackbar,
  useConfig,
  usePatient,
  useVisit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  type MedicationDispense,
  MedicationDispenseStatus,
  type MedicationRequestBundle,
  type InventoryItem,
  MedicationRequestFulfillerStatus,
} from '../types';
import {
  calculateIsFreeTextDosage,
  computeNewFulfillerStatusAfterDispenseEvent,
  getDosageInstruction,
  getFulfillerStatus,
  getUuidFromReference,
  markEncounterAsStale,
  revalidate,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { createStockDispenseRequestPayload, sendStockDispenseRequest } from './stock-dispense/stock.resource';
import { saveMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import { updateMedicationRequestFulfillerStatus } from '../medication-request/medication-request.resource';
import MedicationDispenseReview from './medication-dispense-review.component';
import StockDispense from './stock-dispense/stock-dispense.component';
import styles from './forms.scss';
import { endVisit } from '../visit/visit.resource';

type DispenseFormProps = {
  medicationDispense: MedicationDispense;
  medicationRequestBundle: MedicationRequestBundle;
  mode: 'enter' | 'edit';
  patientUuid?: string;
  encounterUuid: string;
  quantityRemaining: number;
  quantityDispensed: number;
  customWorkspaceTitle?: string;
  onWorkspaceClosed?(): void;
};

const DispenseForm: React.FC<Workspace2DefinitionProps<DispenseFormProps, {}, {}>> = ({
  workspaceProps: {
    medicationDispense,
    medicationRequestBundle,
    mode,
    patientUuid,
    encounterUuid,
    quantityRemaining,
    quantityDispensed,
    customWorkspaceTitle,
    onWorkspaceClosed,
  },
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const { patient, isLoading } = usePatient(patientUuid);
  const config = useConfig<PharmacyConfig>();
  const { activeVisit } = useVisit(patientUuid);

  // Keep track of inventory item
  const [inventoryItem, setInventoryItem] = useState<InventoryItem>();

  // Keep track of medication dispense payload
  const [medicationDispensePayload, setMedicationDispensePayload] = useState<MedicationDispense>();

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shouldCompleteOrder, setShouldCompleteOrder] = useState(false);

  const [isFreeTextDosage, setIsFreeTextDosage] = useState(() => {
    const dosageInstruction = getDosageInstruction(medicationDispense?.dosageInstruction);
    return dosageInstruction ? calculateIsFreeTextDosage(dosageInstruction) : false;
  });

  // Submit medication dispense form
  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      markEncounterAsStale(encounterUuid);
      saveMedicationDispense(medicationDispensePayload, MedicationDispenseStatus.completed, abortController)
        .then((response) => {
          if (response.ok) {
            if (config.completeOrderWithThisDispense && shouldCompleteOrder) {
              return updateMedicationRequestFulfillerStatus(
                getUuidFromReference(
                  medicationDispensePayload.authorizingPrescription[0].reference, // assumes authorizing prescription exist
                ),
                MedicationRequestFulfillerStatus.completed,
              ).then(() => {
                if (config.dispenseBehavior.endActiveVisitOnCompletingOrder) {
                  if (activeVisit) {
                    const visitUuid = activeVisit?.uuid;
                    endVisit(visitUuid).then(() => {});
                  }
                }
                return response;
              });
            }
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
              ).then(() => response);
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
          (response) => {
            const { status } = response;
            if (config.completeOrderWithThisDispense && shouldCompleteOrder && response?.data?.status === 'completed') {
              showSnackbar({
                title: t('prescriptionCompleted', 'Prescription completed'),
                kind: 'success',
                subtitle: t(
                  'prescriptionCompletedSuccessfully',
                  'Medication dispensed and prescription marked as completed',
                ),
              });
            }
            if (status === 201 || status === 200) {
              revalidate(encounterUuid);
              showSnackbar({
                kind: 'success',
                subtitle: t('medicationListUpdated', 'Medication dispense list has been updated.'),
                title: t(
                  mode === 'enter' ? 'medicationDispensed' : 'medicationDispenseUpdated',
                  mode === 'enter'
                    ? 'Medication successfully dispensed.'
                    : 'Medication dispense record successfully updated.',
                ),
              });
              closeWorkspace({ discardUnsavedChanges: true });
              setIsSubmitting(false);
              onWorkspaceClosed?.();
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

  const updateMedicationDispense = useCallback((medicationDispenseUpdate: Partial<MedicationDispense>) => {
    setMedicationDispensePayload((prevState) => ({
      ...prevState,
      ...medicationDispenseUpdate,
    }));
  }, []);

  // whether or not the form is valid and ready to submit
  const isValid = useMemo(() => {
    if (!medicationDispensePayload) {
      return false;
    }
    const anyCodedDosage =
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value ||
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.code ||
      medicationDispensePayload.dosageInstruction[0]?.route?.coding[0]?.code ||
      medicationDispensePayload.dosageInstruction[0]?.timing?.code?.coding[0].code;

    const allCodedDosage =
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.value &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.route?.coding[0]?.code &&
      medicationDispensePayload.dosageInstruction[0]?.timing?.code?.coding[0].code;

    return (
      medicationDispensePayload.performer &&
      medicationDispensePayload.performer[0]?.actor.reference &&
      medicationDispensePayload.quantity?.value &&
      (!quantityRemaining || medicationDispensePayload?.quantity?.value <= quantityRemaining) &&
      medicationDispensePayload.quantity?.code &&
      ((allCodedDosage && !isFreeTextDosage) ||
        (!anyCodedDosage && isFreeTextDosage && medicationDispensePayload.dosageInstruction[0]?.text)) &&
      (!medicationDispensePayload.substitution.wasSubstituted ||
        (medicationDispensePayload.substitution.reason[0]?.coding[0].code &&
          medicationDispensePayload.substitution.type?.coding[0].code))
    );
  }, [isFreeTextDosage, medicationDispensePayload, quantityRemaining]);

  // initialize the internal dispense payload with the dispenses passed in as props
  useEffect(() => setMedicationDispensePayload(medicationDispense), [medicationDispense]);

  // Auto-default "Complete Order With This Dispense" checkbox for orders with no refills
  useEffect(() => {
    // Only auto-default in 'enter' mode when creating a new dispense
    if (mode === 'enter' && medicationRequestBundle?.request?.dispenseRequest) {
      const numberOfRepeatsAllowed = medicationRequestBundle.request.dispenseRequest.numberOfRepeatsAllowed;
      // Default to true if order doesn't support refills
      if (numberOfRepeatsAllowed === 0 || numberOfRepeatsAllowed === null || numberOfRepeatsAllowed === undefined) {
        setShouldCompleteOrder(true);
      }
    }
  }, [medicationRequestBundle, mode]);

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
    <Workspace2 title={customWorkspaceTitle ?? t('dispensePrescription', 'Dispense prescription')}>
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
              {config.dispenseBehavior.allowModifyingPrescription
                ? t('drugHelpText', 'You may edit the formulation and quantity dispensed here')
                : t('drugHelpTextNoEdit', 'You may edit quantity dispensed here')}
            </FormLabel>
            {medicationDispensePayload ? (
              <div>
                <MedicationDispenseReview
                  medicationDispense={medicationDispensePayload}
                  updateMedicationDispense={updateMedicationDispense}
                  isFreeTextDosage={isFreeTextDosage}
                  setIsFreeTextDosage={setIsFreeTextDosage}
                  quantityRemaining={quantityRemaining}
                  quantityDispensed={quantityDispensed}
                />
                {config.completeOrderWithThisDispense && mode === 'enter' && !medicationDispense?.id && (
                  <Checkbox
                    id="complete-order-with-this-dispense"
                    labelText={t('completeOrderWithThisDispense', 'Complete order with this dispense')}
                    checked={shouldCompleteOrder}
                    onChange={(_, { checked }) => setShouldCompleteOrder(checked)}
                  />
                )}
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
          <Button
            disabled={isSubmitting}
            onClick={() => {
              closeWorkspace();
              onWorkspaceClosed?.();
            }}
            kind="secondary">
            {getCoreTranslation('cancel', 'Cancel')}
          </Button>
          <Button disabled={isButtonDisabled} onClick={handleSubmit}>
            {t(
              mode === 'enter' ? 'dispensePrescription' : 'saveChanges',
              mode === 'enter' ? 'Dispense prescription' : 'Save changes',
            )}
          </Button>
        </section>
      </Form>
    </Workspace2>
  );
};

export default DispenseForm;
