import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ExtensionSlot,
  showNotification,
  showToast,
  useConfig,
  useLayoutType,
  usePatient,
} from "@openmrs/esm-framework";
import { Button, FormLabel, InlineLoading } from "@carbon/react";
import styles from "./forms.scss";
import { closeOverlay } from "../hooks/useOverlay";
import {
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationRequestBundle,
  StockDispenseRequest,
} from "../types";
import { PharmacyConfig } from "../config-schema";
import {
  dispensePostProcessor,
  saveMedicationDispense,
} from "../medication-dispense/medication-dispense.resource";
import MedicationDispenseReview from "./medication-dispense-review.component";
import {
  computeNewFulfillerStatusAfterDispenseEvent,
  getFulfillerStatus,
  getUuidFromReference,
  revalidate,
} from "../utils";
import { updateMedicationRequestFulfillerStatus } from "../medication-request/medication-request.resource";

interface DispenseFormProps {
  medicationDispense: MedicationDispense;
  medicationRequestBundle: MedicationRequestBundle;
  mode: "enter" | "edit";
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
  const isTablet = useLayoutType() === "tablet";
  const { patient, isLoading } = usePatient(patientUuid);
  const config = useConfig() as PharmacyConfig;

  // Keep track of medication dispense payload
  const [medicationDispensePayload, setMedicationDispensePayload] =
    useState<MedicationDispense>();

  const [stockItem, setStockItem] = useState<any>();
  // whether or not the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit medication dispense form
  const handleSubmit = () => {
    let dispensedItem: StockDispenseRequest;
    if (stockItem) {
      dispensedItem = {
        locationUuid: stockItem.itemLocation,
        patientUuid: patientUuid,
        orderUuid: medicationRequestBundle.request.id,
        encounterUuid: encounterUuid,
        stockItemUuid: stockItem.stockItemUuid,
        stockBatchUuid: stockItem.batchUuid,
        quantity: medicationDispensePayload.quantity.value,
        stockItemPackagingUOMUuid: stockItem.quantityUoMUuid,
      };
    }

    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      saveMedicationDispense(
        medicationDispensePayload,
        MedicationDispenseStatus.completed,
        abortController
      )
        .then((response) => {
          if (response.ok) {
            const newFulfillerStatus =
              computeNewFulfillerStatusAfterDispenseEvent(
                medicationDispensePayload,
                medicationRequestBundle,
                config.dispenseBehavior.restrictTotalQuantityDispensed
              );
            if (
              getFulfillerStatus(medicationRequestBundle.request) !==
              newFulfillerStatus
            ) {
              return updateMedicationRequestFulfillerStatus(
                getUuidFromReference(
                  medicationDispensePayload.authorizingPrescription[0].reference // assumes authorizing prescription exist
                ),
                newFulfillerStatus
              );
            }
          }
          return response;
        })
        .then(
          ({ status }) => {
            if (status === 201 || status === 200) {
              const abortController = new AbortController();
              dispensePostProcessor(dispensedItem, abortController).then(
                (res) => {
                  if (res) {
                    showToast({
                      critical: true,
                      kind: "success",
                      description: t(
                        "stockUpdated",
                        "Stock inventory item has been updated."
                      ),
                      title: t(
                        mode === "enter" ? "stockUpdated" : "stockUpdated",
                        mode === "enter"
                          ? "Stock inventory item successfully updated."
                          : "Stock inventory item successfully updated."
                      ),
                    });
                  }
                }
              );

              closeOverlay();
              revalidate(encounterUuid);
              showToast({
                critical: true,
                kind: "success",
                description: t(
                  "medicationListUpdated",
                  "Medication dispense list has been updated."
                ),
                title: t(
                  mode === "enter"
                    ? "medicationDispensed"
                    : "medicationDispenseUpdated",
                  mode === "enter"
                    ? "Medication successfully dispensed."
                    : "Dispense record successfully updated."
                ),
              });
            }
          },
          (error) => {
            showNotification({
              title: t(
                mode === "enter"
                  ? "medicationDispenseError"
                  : "medicationDispenseUpdatedError",
                mode === "enter"
                  ? "Error dispensing medication."
                  : "Error updating dispense record"
              ),
              kind: "error",
              critical: true,
              description: error?.message,
            });
            setIsSubmitting(false);
          }
        );
    }
  };

  const checkIsValid = () => {
    if (
      medicationDispensePayload &&
      medicationDispensePayload.quantity?.value &&
      (!quantityRemaining ||
        medicationDispensePayload?.quantity?.value <= quantityRemaining) &&
      medicationDispensePayload.quantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]
        ?.doseQuantity?.value &&
      medicationDispensePayload.dosageInstruction[0]?.doseAndRate[0]
        ?.doseQuantity?.code &&
      medicationDispensePayload.dosageInstruction[0]?.route?.coding[0].code &&
      medicationDispensePayload.dosageInstruction[0]?.timing?.code.coding[0]
        .code &&
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
  useEffect(
    () => setMedicationDispensePayload(medicationDispense),
    [medicationDispense]
  );

  // check is valid on any changes
  useEffect(checkIsValid, [medicationDispensePayload, quantityRemaining]);

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
        {patient && (
          <ExtensionSlot name="patient-header-slot" state={bannerState} />
        )}
        <section className={styles.formGroup}>
          {/* <span style={{ marginTop: "1rem" }}>1. {t("drug", "Drug")}</span>*/}
          <FormLabel>
            {t(
              config.dispenseBehavior.allowModifyingPrescription
                ? "drugHelpText"
                : "drugHelpTextNoEdit",
              config.dispenseBehavior.allowModifyingPrescription
                ? "You may edit the formulation and quantity dispensed here"
                : "You may edit quantity dispensed here"
            )}
          </FormLabel>
          {medicationDispensePayload ? (
            <MedicationDispenseReview
              medicationDispense={medicationDispensePayload}
              updateMedicationDispense={setMedicationDispensePayload}
              quantityRemaining={quantityRemaining}
              setStockItem={setStockItem}
            />
          ) : null}
        </section>
        <section className={styles.buttonGroup}>
          <Button
            disabled={isSubmitting}
            onClick={() => closeOverlay()}
            kind="secondary"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {t(
              mode === "enter" ? "dispensePrescription" : "saveChanges",
              mode === "enter" ? "Dispense prescription" : "Save changes"
            )}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default DispenseForm;
