import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  showToast,
  showNotification,
  useLayoutType,
} from "@openmrs/esm-framework";
import { Button, FormLabel, DataTableSkeleton } from "@carbon/react";
import styles from "./dispense-form.scss";
import { closeOverlay } from "../hooks/useOverlay";
import { MedicationDispense } from "../types";
import { saveMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import MedicationDispenseReview from "../components/medication-dispense-review.component";

interface DispenseFormProps {
  medicationDispenses: Array<MedicationDispense>;
  mutate: Function;
  isLoading: Boolean;
  mode: "enter" | "edit";
}

const DispenseForm: React.FC<DispenseFormProps> = ({
  medicationDispenses,
  mutate,
  isLoading,
  mode,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  // Keep track of medication dispense payload
  const [medicationDispensesPayload, setMedicationDispensesPayload] = useState(
    []
  );

  // whether or note the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit medication dispense form
  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      medicationDispensesPayload.map((dispenseRequest) => {
        saveMedicationDispense(dispenseRequest, abortController).then(
          ({ status }) => {
            if (status === 201 || status === 200) {
              closeOverlay();
              mutate();
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
      });
    }
  };

  // updates the medication dispense referenced by the specified index, this function passed on to the card to allow updating a specific element
  const updateMedicationDispenseRequest = (
    medicationDispenseRequest: MedicationDispense,
    index: number
  ) => {
    setMedicationDispensesPayload(
      medicationDispensesPayload.map((element: MedicationDispense, i) => {
        if (index === i) {
          return medicationDispenseRequest;
        } else {
          return element;
        }
      })
    );
  };

  const checkIsValid = () => {
    if (medicationDispensesPayload) {
      setIsValid(
        medicationDispensesPayload.every((dispense: MedicationDispense) => {
          return (
            dispense.quantity?.value &&
            dispense.quantity?.code &&
            dispense.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity
              ?.value &&
            dispense.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity?.code &&
            dispense.dosageInstruction[0]?.route?.coding[0].code &&
            dispense.dosageInstruction[0]?.timing?.code.coding[0].code &&
            (!dispense.substitution.wasSubstituted ||
              (dispense.substitution.reason[0]?.coding[0].code &&
                dispense.substitution.type?.coding[0].code))
          );
        })
      );
    } else {
      setIsValid(false);
    }
  };

  // initialize the internal dispense payload with the dispenses passed in as props
  useEffect(
    () => setMedicationDispensesPayload(medicationDispenses),
    [medicationDispenses]
  );

  useEffect(checkIsValid, [medicationDispensesPayload]);

  return (
    <div className="">
      {isLoading && <DataTableSkeleton role="progressbar" />}
      <div className={styles.formWrapper}>
        <section className={styles.formGroup}>
          {/* <span style={{ marginTop: "1rem" }}>1. {t("drug", "Drug")}</span>*/}
          <FormLabel>
            {t(
              "drugHelpText",
              "You may edit the formulation and quantity dispensed here"
            )}
          </FormLabel>
          {medicationDispensesPayload &&
            medicationDispensesPayload.map((medicationDispense, index) => (
              <MedicationDispenseReview
                key={index}
                medicationDispense={medicationDispense}
                updateMedicationDispense={updateMedicationDispenseRequest}
                index={index}
              />
            ))}
        </section>
        {/*    <section className={styles.formGroup}>
          <span>2. {t("internalComments", "Internal comments")}</span>
          <TextArea
            id="dispensingNote"
            light={isTablet}
            labelText={t(
              "dispensingNoteText",
              "Add a note to the prescription history"
            )}
            placeholder={t(
              "dispensingNotePlaceholder",
              "Write any additional dispensing notes here"
            )}
            value={internalComments}
            onChange={(e) => setInternalComments(e.target.value)}
          />
        </section>*/}
        <section className={styles.buttonGroup}>
          <Button onClick={() => closeOverlay()} kind="secondary">
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
