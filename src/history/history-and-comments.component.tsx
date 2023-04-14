import React from "react";
import {
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Tile,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import {
  formatDatetime,
  parseDate,
  Session,
  userHasAccess,
  useSession,
} from "@openmrs/esm-framework";
import styles from "./history-and-comments.scss";
import { usePrescriptionDetails } from "../medication-request/medication-request.resource";
import { deleteMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import MedicationEvent from "../components/medication-event.component";
import { launchOverlay } from "../hooks/useOverlay";
import DispenseForm from "../forms/dispense-form.component";
import { MedicationDispense, MedicationDispenseStatus } from "../types";
import {
  PRIVILEGE_DELETE_DISPENSE,
  PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
  PRIVILEGE_EDIT_DISPENSE,
} from "../constants";
import { getDateRecorded } from "../utils";

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  mutate: Function;
}> = ({ encounterUuid, mutate }) => {
  const { t } = useTranslation();
  const session = useSession();
  const {
    requests,
    dispenses,
    mutate: mutatePrescriptionDetails,
    prescriptionDate,
    isError,
    isLoading,
  } = usePrescriptionDetails(encounterUuid);

  const userCanEdit: Function = (session: Session) =>
    session?.user && userHasAccess(PRIVILEGE_EDIT_DISPENSE, session.user);

  const userCanDelete: Function = (
    session: Session,
    medicationDispense: MedicationDispense
  ) => {
    if (session?.user) {
      if (userHasAccess(PRIVILEGE_DELETE_DISPENSE, session.user)) {
        return true;
      } else if (
        userHasAccess(
          PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
          session.user
        ) &&
        session.currentProvider?.uuid &&
        medicationDispense.performer?.find(
          (performer) =>
            performer?.actor?.reference?.length > 1 &&
            performer.actor.reference.split("/")[1] ===
              session.currentProvider.uuid
        ) != null
      ) {
        return true;
      }
    }
    return false;
  };

  const generateMedicationDispenseActionMenu: Function = (
    medicationDispense: MedicationDispense
  ) => {
    const editable =
      medicationDispense.status === MedicationDispenseStatus.completed &&
      userCanEdit(session);
    const deletable = userCanDelete(session, medicationDispense);

    if (!editable && !deletable) {
      return null;
    } else {
      return (
        <OverflowMenu
          ariaLabel={t(
            "medicationDispenseActionMenu",
            "Medication Dispense Action Menu"
          )}
          flipped={true}
          className={styles.medicationEventActionMenu}
        >
          {editable && (
            <OverflowMenuItem
              onClick={() =>
                launchOverlay(
                  t("editDispenseRecord", "Edit Dispense Record"),
                  <DispenseForm
                    medicationDispense={medicationDispense}
                    mode="edit"
                    mutate={() => {
                      mutate();
                      mutatePrescriptionDetails();
                    }}
                  />
                )
              }
              itemText={t("editRecord", "Edit Record")}
            ></OverflowMenuItem>
          )}
          {deletable && (
            <OverflowMenuItem
              onClick={() => {
                deleteMedicationDispense(medicationDispense.id);
                mutate();
                mutatePrescriptionDetails();
              }}
              itemText={t("delete", "Delete")}
            ></OverflowMenuItem>
          )}
        </OverflowMenu>
      );
    }
  };

  const generateDispenseTag: Function = (
    medicationDispense: MedicationDispense
  ) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return <Tag type="gray">{t("dispensed", "Dispensed")}</Tag>;
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return <Tag type="red">{t("paused", "Paused")}</Tag>;
    } else if (
      medicationDispense.status === MedicationDispenseStatus.declined
    ) {
      return <Tag type="red">{t("closed", "Closed")}</Tag>;
    } else {
      return null;
    }
  };

  const generateDispenseVerbiage: Function = (
    medicationDispense: MedicationDispense
  ) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t("dispensedMedication", "dispensed medication");
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t("pausedDispense", "paused dispense");
    } else if (
      medicationDispense.status === MedicationDispenseStatus.declined
    ) {
      return t("closedDispense", "closed dispense");
    } else {
      return null;
    }
  };

  // TODO: assumption is dispenses always are after requests?
  return (
    <div className={styles.historyAndCommentsContainer}>
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>{t("error", "Error")}</p>}
      {dispenses &&
        dispenses.map((dispense) => {
          return (
            <div key={dispense.id}>
              <h5
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {dispense.performer && dispense.performer[0]?.actor?.display}{" "}
                {generateDispenseVerbiage(dispense)} -{" "}
                {formatDatetime(parseDate(getDateRecorded(dispense)))}
              </h5>
              <Tile className={styles.dispenseTile}>
                {generateMedicationDispenseActionMenu(dispense)}
                <MedicationEvent
                  medicationEvent={dispense}
                  status={generateDispenseTag(dispense)}
                />
              </Tile>
            </div>
          );
        })}
      {requests &&
        requests.map((request) => {
          return (
            <div key={request.id}>
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
              <Tile className={styles.requestTile}>
                <MedicationEvent
                  medicationEvent={request}
                  status={<Tag type="green">{t("ordered", "Ordered")}</Tag>}
                />
              </Tile>
            </div>
          );
        })}
    </div>
  );
};

export default HistoryAndComments;
