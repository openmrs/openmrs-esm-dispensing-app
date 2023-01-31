import { DataTableSkeleton, Tile, Tag } from "@carbon/react";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from "./prescription-details.scss";
import { WarningFilled } from "@carbon/react/icons";
import {
  usePrescriptionDetails,
  usePatientAllergies,
} from "../medication-request/medication-request.resource";
import { useTranslation } from "react-i18next";
import MedicationEvent from "../components/medication-event.component";
import { PatientUuid, useConfig } from "@openmrs/esm-framework";
import { MedicationRequest } from "../types";
import { PharmacyConfig } from "../config-schema";

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const [isAllergiesLoaded, setAllergiesLoadedStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(patientUuid);
  const { requests, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);

  useEffect(() => {
    if (typeof totalAllergies == "number") {
      setAllergiesLoadedStatus(false);
    }
  }, [totalAllergies]);

  const generateStatusTag: Function = (
    medicationRequest: MedicationRequest
  ) => {
    if (medicationRequest.status === "cancelled") {
      return <Tag type="red">{t("cancelled", "Cancelled")}</Tag>;
    }

    if (medicationRequest.status === "completed") {
      return <Tag type="red">{t("completed", "Completed")}</Tag>;
    }

    // expired is not based on based actual medication request expired status, but calculated from our configurable expiration period in days
    // NOTE: the assumption here is that the validityPeriod.start is equal to encounter datetime of the associated encounter, because we use the encounter date when querying and calculating the status of the overall encounter
    if (
      medicationRequest.dispenseRequest?.validityPeriod?.start &&
      dayjs(medicationRequest.dispenseRequest.validityPeriod.start).isBefore(
        dayjs(new Date())
          .startOf("day")
          .subtract(config.medicationRequestExpirationPeriodInDays, "day")
      )
    ) {
      return <Tag type="red">{t("expired", "Expired")}</Tag>;
    }

    return null;
  };

  return (
    <div className={styles.prescriptionContainer}>
      {isAllergiesLoaded && <DataTableSkeleton role="progressbar" />}
      {typeof totalAllergies == "number" && (
        <Tile className={styles.allergiesTile}>
          <div className={styles.allergesContent}>
            <div>
              <WarningFilled size={24} className={styles.allergiesIcon} />
              <p>
                <span style={{ fontWeight: "bold" }}>
                  {totalAllergies} {t("allergies", "allergies").toLowerCase()}
                </span>{" "}
                {allergies}
              </p>
              <a href={`dispensing`} onClick={(e) => e.preventDefault()}>
                View
              </a>
            </div>
          </div>
        </Tile>
      )}

      <h5
        style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "0.9rem" }}
      >
        {t("prescribed", "Prescribed")}
      </h5>

      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>{t("error", "Error")}</p>}
      {requests &&
        requests.map((request) => {
          return (
            <Tile className={styles.prescriptionTile}>
              <MedicationEvent
                key={request.id}
                medicationEvent={request}
                status={generateStatusTag(request)}
              />
            </Tile>
          );
        })}
    </div>
  );
};

export default PrescriptionDetails;
