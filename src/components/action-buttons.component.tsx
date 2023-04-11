import React from "react";
import { Button } from "@carbon/react";
import { useConfig, UserHasAccess } from "@openmrs/esm-framework";
import styles from "./action-buttons.scss";
import { useTranslation } from "react-i18next";
import { MedicationRequest } from "../types";
import { PRIVILEGE_CREATE_DISPENSE } from "../constants";
import { PharmacyConfig } from "../config-schema";
import { launchOverlay } from "../hooks/useOverlay";
import InitializeDispenseFormFromRequest from "../forms/initialize-dispense-form-from-request.component";
import { computeStatus } from "../utils";

interface ActionButtonsProps {
  medicationRequest: MedicationRequest;
  mutate: Function;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  medicationRequest,
  mutate,
}) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const dispensable =
    computeStatus(
      medicationRequest,
      config.medicationRequestExpirationPeriodInDays
    ) === "active";
  return (
    <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
      {dispensable ? (
        <Button
          kind="primary"
          className={styles.dispenseBtn}
          onClick={() =>
            launchOverlay(
              t("dispensePrescription", "Dispense prescription"),
              <InitializeDispenseFormFromRequest
                medicationRequest={medicationRequest}
                mutate={mutate}
              />
            )
          }
        >
          {t("dispense", "Dispense")}
        </Button>
      ) : null}
    </UserHasAccess>
  );
};

export default ActionButtons;
