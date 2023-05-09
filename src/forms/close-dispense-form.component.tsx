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
import { Button, ComboBox, InlineLoading } from "@carbon/react";
import {
  saveMedicationDispense,
  useReasonForCloseValueSet,
} from "../medication-dispense/medication-dispense.resource";
import { closeOverlay } from "../hooks/useOverlay";
import styles from "./forms.scss";
import { PharmacyConfig } from "../config-schema";
import { updateMedicationRequestFulfillerStatus } from "../medication-request/medication-request.resource";
import {
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationRequestFulfillerStatus,
} from "../types";
import { getUuidFromReference, revalidate } from "../utils";

interface CloseDispenseFormProps {
  medicationDispense: MedicationDispense;
  mode: "enter" | "edit";
  patientUuid?: string;
  encounterUuid: string;
}

const CloseDispenseForm: React.FC<CloseDispenseFormProps> = ({
  medicationDispense,
  mode,
  patientUuid,
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const isTablet = useLayoutType() === "tablet";
  const { patient, isLoading } = usePatient(patientUuid);

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
      )
        .then((response) => {
          // only update request status when added a new dispense event, not updating
          if (response.ok && !medicationDispense.id) {
            return updateMedicationRequestFulfillerStatus(
              getUuidFromReference(
                medicationDispensePayload.authorizingPrescription[0].reference // assumes authorizing prescription exist
              ),
              MedicationRequestFulfillerStatus.declined
            );
          } else {
            return response;
          }
        })
        .then((response) => {
          if (response.ok) {
            closeOverlay();
            revalidate(encounterUuid);
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
        })
        .catch((error) => {
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
        });
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
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={bannerState}
          />
        )}
        <section className={styles.formGroup}>
          <ComboBox
            id="reasonForPause"
            light={isTablet}
            items={reasonsForClose}
            titleText={t("reasonForClose", "Reason for close")}
            itemToString={(item) => item?.text}
            initialSelectedItem={{
              id: medicationDispense.statusReasonCodeableConcept?.coding[0]
                ?.code,
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
    </div>
  );
};

export default CloseDispenseForm;
