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
  useReasonForPauseValueSet,
} from "../medication-dispense/medication-dispense.resource";
import { closeOverlay } from "../hooks/useOverlay";
import styles from "./forms.scss";
import { PharmacyConfig } from "../config-schema";

interface PauseDispenseFormProps {
  medicationDispense: MedicationDispense;
  mutate: Function;
  mode: "enter" | "edit";
}

const PauseDispenseForm: React.FC<PauseDispenseFormProps> = ({
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
  const [reasonsForPause, setReasonsForPause] = useState([]);
  const { reasonForPauseValueSet } = useReasonForPauseValueSet(
    config.valueSets.reasonForPause.uuid
  );

  useEffect(() => {
    const reasonForPauseOptions = [];

    if (reasonForPauseValueSet?.compose?.include) {
      const uuidValueSet = reasonForPauseValueSet.compose.include.find(
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
    setReasonsForPause(reasonForPauseOptions);
  }, [reasonForPauseValueSet]);

  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      saveMedicationDispense(
        medicationDispensePayload,
        MedicationDispenseStatus.on_hold,
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
                  ? "medicationDispensePaused"
                  : "medicationDispenseUpdated",
                mode === "enter"
                  ? "Medication dispense paused."
                  : "Dispense record successfully updated."
              ),
              title: t(
                mode === "enter"
                  ? "medicationDispensePaused"
                  : "medicationDispenseUpdated",
                mode === "enter"
                  ? "Medication dispense paused."
                  : "Dispense record successfully updated."
              ),
            });
          }
        },
        (error) => {
          showNotification({
            title: t(
              mode === "enter"
                ? "medicationDispensePauseError"
                : "medicationDispenseUpdatedError",
              mode === "enter"
                ? "Error pausing medication dispense."
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
          items={reasonsForPause}
          titleText={t("reasonForPause", "Reason for pause")}
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
            mode === "enter" ? "pause" : "saveChanges",
            mode === "enter" ? "Pause" : "Save changes"
          )}
        </Button>
      </section>
    </div>
  );
};

export default PauseDispenseForm;
