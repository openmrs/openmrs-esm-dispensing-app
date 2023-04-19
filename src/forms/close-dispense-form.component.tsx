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

interface CloseDispenseFormProps {
  medicationDispense: MedicationDispense;
  mutate: Function;
}

const CloseDispenseForm: React.FC<CloseDispenseFormProps> = ({
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
                "medicationDispenseClosed",
                "Medication dispense closed."
              ),
              title: t(
                "medicationDispenseClosed",
                "Medication dispense closed."
              ),
            });
          }
        },
        (error) => {
          showNotification({
            title: t(
              "medicationDispenseCloseError",
              "Error closing medication dispense."
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
          {t("close", "Cancel")}
        </Button>
        <Button disabled={isSubmitting} onClick={handleSubmit}>
          {t("pause", "Close")}
        </Button>
      </section>
    </div>
  );
};

export default CloseDispenseForm;
