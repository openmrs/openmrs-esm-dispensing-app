import React from "react";
import { Button } from "@carbon/react";
import { useConfig, useSession } from "@openmrs/esm-framework";
import styles from "./action-buttons.scss";
import { useTranslation } from "react-i18next";
import {
  MedicationDispenseStatus,
  MedicationRequestBundle,
  MedicationRequestStatus,
} from "../types";
import { PharmacyConfig } from "../config-schema";
import { launchOverlay } from "../hooks/useOverlay";
import {
  computeMedicationRequestStatus,
  computeQuantityRemaining,
  getMostRecentMedicationDispenseStatus,
} from "../utils";
import DispenseForm from "../forms/dispense-form.component";
import { initiateMedicationDispenseBody } from "../medication-dispense/medication-dispense.resource";
import PauseDispenseForm from "../forms/pause-dispense-form.component";
import CloseDispenseForm from "../forms/close-dispense-form.component";

interface ActionButtonsProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const session = useSession();
  const mostRecentMedicationDispenseStatus: MedicationDispenseStatus =
    getMostRecentMedicationDispenseStatus(medicationRequestBundle.dispenses);
  const medicationRequestStatus = computeMedicationRequestStatus(
    medicationRequestBundle.request,
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

  let quantityRemaining = null;
  if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
    quantityRemaining = computeQuantityRemaining(medicationRequestBundle);
  }

  return (
    <div className={styles.actionBtns}>
      {dispensable ? (
        <Button
          kind="primary"
          onClick={() =>
            launchOverlay(
              t("dispensePrescription", "Dispense prescription"),
              <DispenseForm
                patientUuid={patientUuid}
                encounterUuid={encounterUuid}
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequestBundle.request,
                  session,
                  true
                )}
                medicationRequestBundle={medicationRequestBundle}
                quantityRemaining={quantityRemaining}
                mode="enter"
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
                patientUuid={patientUuid}
                encounterUuid={encounterUuid}
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequestBundle.request,
                  session,
                  false
                )}
                mode="enter"
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
                patientUuid={patientUuid}
                encounterUuid={encounterUuid}
                medicationDispense={initiateMedicationDispenseBody(
                  medicationRequestBundle.request,
                  session,
                  false
                )}
                mode="enter"
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
