import { DataTableSkeleton, Tag, Tile } from "@carbon/react";
import React, { useEffect, useState } from "react";
import styles from "./prescription-details.scss";
import { WarningFilled } from "@carbon/react/icons";
import {
  usePatientAllergies,
  usePrescriptionDetails,
} from "../medication-request/medication-request.resource";
import { useTranslation } from "react-i18next";
import MedicationEvent from "../components/medication-event.component";
import { PatientUuid, useConfig, UserHasAccess } from "@openmrs/esm-framework";
import {
  AllergyIntolerance,
  MedicationRequest,
  MedicationRequestCombinedStatus,
} from "../types";
import { PharmacyConfig } from "../config-schema";
import {
  computeMedicationRequestCombinedStatus,
  getConceptCodingDisplay,
} from "../utils";
import ActionButtons from "../components/action-buttons.component";
import { PRIVILEGE_CREATE_DISPENSE } from "../constants";

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const [isAllergiesLoading, setAllergiesLoadingStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(
    patientUuid,
    config.refreshInterval
  );
  const { medicationRequestBundles, isError, isLoading } =
    usePrescriptionDetails(encounterUuid, config.refreshInterval);

  useEffect(() => {
    if (typeof totalAllergies == "number") {
      setAllergiesLoadingStatus(false);
    }
  }, [totalAllergies]);

  const generateStatusTag: Function = (
    medicationRequest: MedicationRequest
  ) => {
    const combinedStatus: MedicationRequestCombinedStatus =
      computeMedicationRequestCombinedStatus(
        medicationRequest,
        config.medicationRequestExpirationPeriodInDays
      );
    if (combinedStatus === MedicationRequestCombinedStatus.cancelled) {
      return <Tag type="red">{t("cancelled", "Cancelled")}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.completed) {
      return <Tag type="green">{t("completed", "Completed")}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.expired) {
      return <Tag type="red">{t("expired", "Expired")}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.declined) {
      return <Tag type="red">{t("closed", "Closed")}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.on_hold) {
      return <Tag type="red">{t("paused", "Paused")}</Tag>;
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
      {medicationRequestBundles &&
        medicationRequestBundles.map((bundle) => {
          return (
            <Tile className={styles.prescriptionTile}>
              <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
                <ActionButtons
                  patientUuid={patientUuid}
                  encounterUuid={encounterUuid}
                  medicationRequestBundle={bundle}
                />
              </UserHasAccess>
              <MedicationEvent
                key={bundle.request.id}
                medicationEvent={bundle.request}
                status={generateStatusTag(bundle.request)}
              />
            </Tile>
          );
        })}
    </div>
  );
};

export default PrescriptionDetails;
