import { DataTableSkeleton, Tile, Tag } from "@carbon/react";
import React, { useEffect, useState } from "react";
import styles from "./prescription-details.scss";
import { WarningFilled } from "@carbon/react/icons";
import {
  usePrescriptionDetails,
  usePatientAllergies,
} from "../medication-request/medication-request.resource";
import { useTranslation } from "react-i18next";
import MedicationEvent from "../components/medication-event.component";
import { PatientUuid, useConfig } from "@openmrs/esm-framework";
import { AllergyIntolerance, MedicationRequest } from "../types";
import { PharmacyConfig } from "../config-schema";
import { computeStatus, getConceptCodingDisplay } from "../utils";

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const [isAllergiesLoading, setAllergiesLoadingStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(patientUuid);
  const { requests, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);

  useEffect(() => {
    if (typeof totalAllergies == "number") {
      setAllergiesLoadingStatus(false);
    }
  }, [totalAllergies]);

  const generateStatusTag: Function = (
    medicationRequest: MedicationRequest
  ) => {
    const status = computeStatus(
      medicationRequest,
      config.medicationRequestExpirationPeriodInDays
    );
    if (status === "cancelled") {
      return <Tag type="red">{t("cancelled", "Cancelled")}</Tag>;
    }

    if (status === "completed") {
      return <Tag type="red">{t("completed", "Completed")}</Tag>;
    }

    if (status === "expired") {
      return <Tag type="red">{t("expired", "Expired")}</Tag>;
    }

    return null;
  };

  const displayAllergies: Function = (allergies: Array<AllergyIntolerance>) => {
    return allergies
      .map((allergy) => getConceptCodingDisplay(allergy.code.coding))
      .join(", ");
  };

  return (
    <div className={styles.prescriptionContainer}>
      {isAllergiesLoading && <DataTableSkeleton role="progressbar" />}
      {!isAllergiesLoading && (
        <Tile className={styles.allergiesTile}>
          <div className={styles.allergesContent}>
            <div>
              <WarningFilled size={24} className={styles.allergiesIcon} />
              <p>
                {totalAllergies > 0 && (
                  <span>
                    <span style={{ fontWeight: "bold" }}>
                      {totalAllergies}{" "}
                      {t("allergies", "allergies").toLowerCase()}
                    </span>{" "}
                    {displayAllergies(allergies)}
                  </span>
                )}
                {totalAllergies == 0 &&
                  t("noAllergyDetailsFound", "No allergy details found")}
              </p>
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
