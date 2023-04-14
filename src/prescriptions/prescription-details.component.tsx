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
  MedicationDispense,
  MedicationRequest,
  MedicationRequestMedicationDispenseCombinedStatus,
} from "../types";
import { PharmacyConfig } from "../config-schema";
import {
  computeMedicationRequestMedicationDispenseCombinedStatus,
  computeMedicationRequestStatus,
  getAssociatedMedicationDispenses,
  getConceptCodingDisplay,
  getMostRecentMedicationDispenseStatus,
} from "../utils";
import ActionButtons from "../components/action-buttons.component";
import { PRIVILEGE_CREATE_DISPENSE } from "../constants";

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
  mutate: Function;
}> = ({ encounterUuid, patientUuid, mutate }) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const [isAllergiesLoading, setAllergiesLoadingStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(patientUuid);
  const {
    requests,
    dispenses,
    mutate: mutatePrescriptionDetails,
    isError,
    isLoading,
  } = usePrescriptionDetails(encounterUuid);

  useEffect(() => {
    if (typeof totalAllergies == "number") {
      setAllergiesLoadingStatus(false);
    }
  }, [totalAllergies]);

  const generateStatusTag: Function = (
    medicationRequest: MedicationRequest,
    medicationDispenses: Array<MedicationDispense>
  ) => {
    const medicationRequestStatus = computeMedicationRequestStatus(
      medicationRequest,
      config.medicationRequestExpirationPeriodInDays
    );
    const medicationDispenseStatus =
      getMostRecentMedicationDispenseStatus(medicationDispenses);
    const combinedStatus: MedicationRequestMedicationDispenseCombinedStatus =
      computeMedicationRequestMedicationDispenseCombinedStatus(
        medicationRequestStatus,
        medicationDispenseStatus
      );
    if (
      combinedStatus ===
      MedicationRequestMedicationDispenseCombinedStatus.cancelled
    ) {
      return <Tag type="red">{t("cancelled", "Cancelled")}</Tag>;
    }

    if (
      combinedStatus ===
      MedicationRequestMedicationDispenseCombinedStatus.completed
    ) {
      return <Tag type="green">{t("completed", "Completed")}</Tag>;
    }

    if (
      combinedStatus ===
      MedicationRequestMedicationDispenseCombinedStatus.expired
    ) {
      return <Tag type="red">{t("expired", "Expired")}</Tag>;
    }

    if (
      combinedStatus ===
      MedicationRequestMedicationDispenseCombinedStatus.declined
    ) {
      return <Tag type="red">{t("closed", "Closed")}</Tag>;
    }

    if (
      combinedStatus ===
      MedicationRequestMedicationDispenseCombinedStatus.on_hold
    ) {
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
      {requests &&
        requests.map((request) => {
          const associatedMedicationDispenses =
            getAssociatedMedicationDispenses(request, dispenses);
          return (
            <Tile className={styles.prescriptionTile}>
              <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
                <ActionButtons
                  medicationRequest={request}
                  associatedMedicationDispenses={associatedMedicationDispenses}
                  mutate={() => {
                    mutate();
                    mutatePrescriptionDetails();
                  }}
                />
              </UserHasAccess>
              <MedicationEvent
                key={request.id}
                medicationEvent={request}
                status={generateStatusTag(
                  request,
                  associatedMedicationDispenses
                )}
              />
            </Tile>
          );
        })}
    </div>
  );
};

export default PrescriptionDetails;
