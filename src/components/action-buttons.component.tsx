import React from "react";
import { Button } from "@carbon/react";
import { useConfig, usePatient, useSession } from "@openmrs/esm-framework";
import styles from "./action-buttons.scss";
import { useTranslation } from "react-i18next";
import {
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationRequest,
  MedicationRequestStatus,
} from "../types";
import { PharmacyConfig } from "../config-schema";
import { launchOverlay } from "../hooks/useOverlay";
import {
  computeMedicationRequestStatus,
  getMostRecentMedicationDispenseStatus,
} from "../utils";
import DispenseForm from "../forms/dispense-form.component";
import { initiateMedicationDispenseBody } from "../medication-dispense/medication-dispense.resource";
import PauseDispenseForm from "../forms/pause-dispense-form.component";
import CloseDispenseForm from "../forms/close-dispense-form.component";

interface ActionButtonsProps {
  medicationRequest: MedicationRequest;
  associatedMedicationDispenses: Array<MedicationDispense>;
  mutate: Function;
  patientUuid?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  medicationRequest,
  associatedMedicationDispenses,
  mutate,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const session = useSession();
  const { patient, isLoading } = usePatient(patientUuid);
  const mostRecentMedicationDispenseStatus: MedicationDispenseStatus =
    getMostRecentMedicationDispenseStatus(associatedMedicationDispenses);
  const medicationRequestStatus = computeMedicationRequestStatus(
    medicationRequest,
    config.medicationRequestExpirationPeriodInDays
  );
  const dispensable =
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const pauseable =
    config.actionButtons.pauseButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.on_hold &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const closeable =
    config.actionButtons.closeButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const DesignName = () => {
    const styles = { paddingLeft: "20px", color: "gray", fontWeight: 500 };

    if (patient) {
      return (
        <span style={styles}>
          {`${patient.name[0].given[0]} ${patient.name[0].family} — #${patient.identifier[0].value}`}
        </span>
      );
    }

    return <span style={styles}>--- --</span>;
  };

  return (
    <div className={styles.actionBtns}>
      {dispensable ? (
        <Button
          kind="primary"
          onClick={() =>
            launchOverlay(
              <>
                {t("dispensePrescription", "Dispense prescription")}
                <DesignName />
              </>,
              <DispenseForm
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequest,
                  session,
                  true
                )}
                mode="enter"
                mutate={mutate}
              />
            )
          }
        >
          {t("dispense", "Dispense")}
        </Button>
      ) : null}
      {pauseable ? (
        <Button
          kind="secondary"
          onClick={() =>
            launchOverlay(
              t("pausePrescription", "Pause prescription"),
              <PauseDispenseForm
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequest,
                  session,
                  false
                )}
                mode="enter"
                mutate={mutate}
              />
            )
          }
        >
          {t("pause", "Pause")}
        </Button>
      ) : null}
      {closeable ? (
        <Button
          kind="danger"
          onClick={() =>
            launchOverlay(
              t("closePrescription", "Close prescription"),
              <CloseDispenseForm
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequest,
                  session,
                  false
                )}
                mode="enter"
                mutate={mutate}
              />
            )
          }
        >
          {t("close", "Close")}
        </Button>
      ) : null}
    </div>
  );
};

export default ActionButtons;
