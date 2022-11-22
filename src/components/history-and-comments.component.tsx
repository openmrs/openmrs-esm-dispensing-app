import React from "react";
import {
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { parseDate, formatDatetime } from "@openmrs/esm-framework";
import styles from "./history-and-comments.scss";
import { usePrescriptionDetails } from "../medication-request/medication-request.resource";
import { deleteMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import MedicationEventCard from "./medication-event-card.component";

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  mutatePrescriptionTableRows: Function;
}> = ({ encounterUuid, mutatePrescriptionTableRows }) => {
  const { t } = useTranslation();
  const { requests, dispenses, mutate, prescriptionDate, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);

  const generateMedicationDispenseActionMenu: Function = (
    medicationDispenseUuid: string
  ) => (
    <OverflowMenu flipped={true} className={styles.medicationEventActionMenu}>
      <OverflowMenuItem
        onClick={() => {
          deleteMedicationDispense(medicationDispenseUuid);
          mutate();
          mutatePrescriptionTableRows();
        }}
        itemText={t("delete", "Delete")}
      ></OverflowMenuItem>
    </OverflowMenu>
  );

  // TODO: assumption is dispenses always are after requests?
  return (
    <div className={styles.historyAndCommentsContainer}>
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>Error</p>}
      {dispenses &&
        dispenses.map((dispense) => {
          return (
            <div>
              <h5
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {dispense.performer && dispense.performer[0]?.actor?.display}{" "}
                {t("dispensedMedication", "dispensed medication")} -{" "}
                {formatDatetime(parseDate(dispense.whenHandedOver))}
              </h5>
              <MedicationEventCard
                medication={dispense}
                actionMenu={generateMedicationDispenseActionMenu(dispense.id)}
              />
            </div>
          );
        })}
      {requests &&
        requests.map((request) => {
          return (
            <div>
              <h5
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {request.requester.display}{" "}
                {t("orderedMedication ", "ordered medication")} -{" "}
                {formatDatetime(prescriptionDate)}
              </h5>
              <MedicationEventCard medication={request} />
            </div>
          );
        })}
    </div>
  );
};

export default HistoryAndComments;
