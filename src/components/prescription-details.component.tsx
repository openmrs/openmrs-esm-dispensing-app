import { DataTableSkeleton, Tile } from "carbon-components-react";
import React from "react";
import styles from "./prescription-details.scss";
import { WarningFilled24 } from "@carbon/icons-react";
import { useOrderDetails } from "../medication-request/medication-request.resource";
import { useTranslation } from "react-i18next";
import MedicationCard from "./medication-card.component";

const PrescriptionDetails: React.FC<{ encounterUuid: string }> = ({
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const { medications, isError, isLoading } = useOrderDetails(encounterUuid);

  return (
    <div className={styles.prescriptionContainer}>
      <Tile className={styles.allergiesTile}>
        <div className={styles.allergesContent}>
          <div>
            <WarningFilled24 className={styles.allergiesIcon} />
            <p>
              <b>3 allergies</b> Penicillin, Naproxen sodium, Ibuprofen
            </p>
            <a href={`dispensing`} onClick={(e) => e.preventDefault()}>
              View
            </a>
          </div>
        </div>
      </Tile>

      <h5
        style={{ paddingTop: "8px", paddingBottom: "8px", fontSize: "0.9rem" }}
      >
        Prescribed
      </h5>

      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>Error</p>}
      {medications &&
        medications.map((medication) => {
          return <MedicationCard medication={medication} />;
        })}
    </div>
  );
};

export default PrescriptionDetails;
