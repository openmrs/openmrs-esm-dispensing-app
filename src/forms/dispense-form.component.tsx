import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExtensionSlot,
  formatDatetime,
  showSnackbar,
  useConfig,
  useLayoutType,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { Button, FormLabel, InlineLoading, Layer, Checkbox } from '@carbon/react';
import styles from './forms.scss';
import { closeOverlay } from '../hooks/useOverlay';
import {
  type MedicationDispense,
  type MedicationRequestBundle,
  type InventoryItem,
  type DispenseFormHandlerParams,
} from '../types';
import MedicationDispenseReview from './medication-dispense-review.component';
import { revalidate } from '../utils';
import { type PharmacyConfig } from '../config-schema';
import StockDispense from './stock-dispense/stock-dispense.component';
import { executeMedicationDispenseChain } from './dispense-form-handler';

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
  const isTablet = useLayoutType() === 'tablet';
  const { patient, isLoading } = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const config = useConfig<PharmacyConfig>();

  // Keep track of inventory item
  const [inventoryItem, setInventoryItem] = useState<InventoryItem>();
  // Keep track of whether to close visit on dispense
  const [closeVisitOnDispense, setCloseVisitOnDispense] = useState(false);
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

      const dispenseFormHandlerParams: DispenseFormHandlerParams = {
        medicationDispensePayload,
        medicationRequestBundle,
        config,
        inventoryItem,
        patientUuid,
        encounterUuid,
        abortController,
        closeOverlay,
        revalidate,
        closeVisitOnDispense,
        setIsSubmitting,
        mode,
        t,
        currentVisit,
      };

      executeMedicationDispenseChain(dispenseFormHandlerParams).catch((error) => {
        showSnackbar({
          title: t(
            mode === 'enter' ? 'medicationDispenseError' : 'medicationDispenseUpdatedError',
            mode === 'enter' ? 'Error dispensing medication.' : 'Error updating dispense record',
          ),
          kind: 'error',
          isLowContrast: true,
          subtitle: error?.message,
        });
        setIsSubmitting(false);
      });
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
  const shouldEndCurrentVisitCheckbox = useMemo(() => {
    return (
      config.endVisitOnDispense &&
      currentVisit &&
      config.endVisitOnDispense.visitTypesUuids.includes(currentVisit.visitType.uuid)
    );
  }, [config.endVisitOnDispense, currentVisit]);

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
    <div className="">
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
              config.dispenseBehavior?.allowModifyingPrescription ? 'drugHelpText' : 'drugHelpTextNoEdit',
              config.dispenseBehavior?.allowModifyingPrescription
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
              {shouldEndCurrentVisitCheckbox && (
                <Layer>
                  <Checkbox
                    className={styles.closeVisitCheckBox}
                    labelText={t('closeVisitOnDispense', 'Close {{visitType}} visit started at {{startDatetime}}', {
                      visitType: currentVisit?.visitType.display?.toLocaleLowerCase(),
                      startDatetime: formatDatetime(new Date(currentVisit?.startDatetime), {
                        noToday: true,
                      }),
                    })}
                    id="closeVisitOnDispense"
                    onChange={(event, { checked, id }) => setCloseVisitOnDispense(checked)}
                  />
                </Layer>
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
