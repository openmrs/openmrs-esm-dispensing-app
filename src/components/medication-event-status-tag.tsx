import React from "react";
import { MedicationDispense, MedicationRequest } from "../types";
import { Tag } from "@carbon/react";
import { useTranslation } from "react-i18next";

const MedicationEventStatusTag: React.FC<{
  medicationEvent: MedicationRequest | MedicationDispense;
}> = ({ medicationEvent }) => {
  const { t } = useTranslation();

  if (!medicationEvent.status || medicationEvent.status === "active") {
    return null;
  }

  if (medicationEvent.status === "stopped") {
    return <Tag type="red">{t("expired", "Expired")}</Tag>;
  }

  if (medicationEvent.status === "cancelled") {
    return <Tag type="red">{t("cancelled", "Cancelled")}</Tag>;
  }
  // TODO support completed status & will need to change expired once we change the definition of expired
  // TODO will need to support potential Medication Dispense statuses or refactor into different request and dispense components
  return null;
};

export default MedicationEventStatusTag;
