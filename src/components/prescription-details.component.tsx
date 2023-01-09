import { DataTableSkeleton, Tile } from "@carbon/react";
import React, { useEffect, useState } from "react";
import styles from "./prescription-details.scss";
import { WarningFilled } from "@carbon/react/icons";
import {
  usePrescriptionDetails,
  usePatientAllergies,
} from "../medication-request/medication-request.resource";
import { useTranslation } from "react-i18next";
import MedicationEventCard from "./medication-event-card.component";
import { PatientUuid } from "@openmrs/esm-framework";

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const [isAllergiesLoaded, setAllergiesLoadedStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(patientUuid);
  const { requests, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);

  useEffect(() => {
    if (typeof totalAllergies == "number") {
      setAllergiesLoadedStatus(false);
    }
  }, [totalAllergies]);

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
          return <MedicationEventCard key={request.id} medication={request} />;
        })}
    </div>
  );
};

export default PrescriptionDetails;
