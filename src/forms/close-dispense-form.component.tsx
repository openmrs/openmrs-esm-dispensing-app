import React, { useEffect, useState } from "react";
import { MedicationDispense, MedicationDispenseStatus } from "../types";
import { useTranslation } from "react-i18next";
import {
  showNotification,
  showToast,
  useConfig,
  useLayoutType,
} from "@openmrs/esm-framework";
import { Button, ComboBox } from "@carbon/react";
import {
  saveMedicationDispense,
  useReasonForCloseValueSet,
} from "../medication-dispense/medication-dispense.resource";
import { closeOverlay } from "../hooks/useOverlay";
import styles from "./forms.scss";
import { PharmacyConfig } from "../config-schema";

interface CloseDispenseFormProps {
  medicationDispense: MedicationDispense;
  mutate: Function;
  mode: "enter" | "edit";
}

const CloseDispenseForm: React.FC<CloseDispenseFormProps> = ({
  medicationDispense,
  mutate,
  mode,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const isTablet = useLayoutType() === "tablet";
  // Keep track of medication dispense payload
  const [medicationDispensePayload, setMedicationDispensePayload] =
    useState<MedicationDispense>();
  // whether or not the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);
  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonsForClose, setReasonsForClose] = useState([]);
  const { reasonForCloseValueSet } = useReasonForCloseValueSet(
    config.valueSets.reasonForClose.uuid
  );

  useEffect(() => {
    const reasonForPauseOptions = [];

    if (reasonForCloseValueSet?.compose?.include) {
      const uuidValueSet = reasonForCloseValueSet.compose.include.find(
        (include) => !include.system
      );
      if (uuidValueSet) {
        uuidValueSet.concept?.forEach((concept) =>
          reasonForPauseOptions.push({
            id: concept.code,
            text: concept.display,
          })
        );
      }
    }
    setReasonsForClose(reasonForPauseOptions);
  }, [reasonForCloseValueSet]);

  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      saveMedicationDispense(
        medicationDispensePayload,
        MedicationDispenseStatus.declined,
        abortController
      ).then(
        ({ status }) => {
          if (status === 201 || status === 200) {
            closeOverlay();
            mutate();
            showToast({
              critical: true,
              kind: "success",
              description: t(
                mode === "enter"
                  ? "medicationDispenseClosed"
                  : "medicationDispenseUpdated",
                mode === "enter"
                  ? "Medication dispense closed."
                  : "Dispense record successfully updated."
              ),
              title: t(
                mode === "enter"
                  ? "medicationDispenseClosed"
                  : "medicationDispenseUpdated",
                mode === "enter"
                  ? "Medication dispense closed."
                  : "Dispense record successfully updated."
              ),
            });
          }
        },
        (error) => {
          showNotification({
            title: t(
              mode === "enter"
                ? "medicationDispenseCloseError"
                : "medicationDispenseUpdatedError",
              mode === "enter"
                ? "Error closing medication dispense."
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
      medicationDispensePayload.statusReasonCodeableConcept?.coding[0].code
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
  useEffect(checkIsValid, [medicationDispensePayload]);

  return (
    <div className={styles.formWrapper}>
      <section className={styles.formGroup}>
        <ComboBox
          id="reasonForPause"
          light={isTablet}
          items={reasonsForClose}
          titleText={t("reasonForClose", "Reason for close")}
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
      </section>
      <section className={styles.buttonGroup}>
        <Button onClick={() => closeOverlay()} kind="secondary">
          {t("cancel", "Cancel")}
        </Button>
        <Button disabled={!isValid || isSubmitting} onClick={handleSubmit}>
          {t(
            mode === "enter" ? "close" : "saveChanges",
            mode === "enter" ? "Close" : "Save changes"
          )}
        </Button>
      </section>
    </div>
  );
};

export default CloseDispenseForm;
