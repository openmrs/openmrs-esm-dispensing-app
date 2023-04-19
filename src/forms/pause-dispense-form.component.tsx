import React, { useState } from "react";
import { MedicationDispense, MedicationDispenseStatus } from "../types";
import { useTranslation } from "react-i18next";
import {
  showNotification,
  showToast,
  useLayoutType,
} from "@openmrs/esm-framework";
import { Button } from "@carbon/react";
import { saveMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import { closeOverlay } from "../hooks/useOverlay";
import styles from "./forms.scss";
import MedicationCard from "../components/medication-card.component";
import { getMedicationReferenceOrCodeableConcept } from "../utils";
// TODO sharing styles fyi

interface PauseDispenseFormProps {
  medicationDispense: MedicationDispense;
  mutate: Function;
}

const PauseDispenseForm: React.FC<PauseDispenseFormProps> = ({
  medicationDispense,
  mutate,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  // to prevent duplicate submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      const abortController = new AbortController();
      saveMedicationDispense(
        medicationDispense,
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
                "medicationDispensePaused",
                "Medication dispense paused."
              ),
              title: t(
                "medicationDispensePaused",
                "Medication dispense paused."
              ),
            });
          }
        },
        (error) => {
          showNotification({
            title: t(
              "medicationDispensePauseError",
              "Error pausing medication dispense."
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

  return (
    <div className={styles.formWrapper}>
      <section className={styles.formGroup}>
        {/* <FormLabel>
          {t(
            "TODO",
            "TODO"
          )}
        </FormLabel>*/}
        <MedicationCard
          medication={getMedicationReferenceOrCodeableConcept(
            medicationDispense
          )}
        />
      </section>
      <section className={styles.buttonGroup}>
        <Button onClick={() => closeOverlay()} kind="secondary">
          {t("cancel", "Cancel")}
        </Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {t("pause", "Pause")}
        </Button>
      </section>
    </div>
  );
};

export default PauseDispenseForm;
