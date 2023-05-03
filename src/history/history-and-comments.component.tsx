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
import {
  updateMedicationRequestFulfillerStatus,
  usePrescriptionDetails,
} from "../medication-request/medication-request.resource";
import { deleteMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import MedicationEvent from "../components/medication-event.component";
import { launchOverlay } from "../hooks/useOverlay";
import DispenseForm from "../forms/dispense-form.component";
import {
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationRequestFulfillerStatus,
} from "../types";
import {
  PRIVILEGE_DELETE_DISPENSE,
  PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
  PRIVILEGE_EDIT_DISPENSE,
} from "../constants";
import {
  getDateRecorded,
  getNextMostRecentMedicationDispenseStatus,
  getUuidFromReference,
  isMostRecentMedicationDispenseStatus,
} from "../utils";
import PauseDispenseForm from "../forms/pause-dispense-form.component";
import CloseDispenseForm from "../forms/close-dispense-form.component";

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  mutate: Function;
  patientUuid: string;
}> = ({ encounterUuid, mutate, patientUuid }) => {
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

  const generateForm: Function = (
    medicationDispense: MedicationDispense,
    mutate: Function,
    mutatePrescriptionDetails: Function
  ) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return (
        <DispenseForm
          patientUuid={patientUuid}
          medicationDispense={medicationDispense}
          mode="edit"
          mutate={() => {
            mutate();
            mutatePrescriptionDetails();
          }}
        />
      );
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return (
        <PauseDispenseForm
          patientUuid={patientUuid}
          medicationDispense={medicationDispense}
          mode="edit"
          mutate={() => {
            mutate();
            mutatePrescriptionDetails();
          }}
        />
      );
    } else if (
      medicationDispense.status === MedicationDispenseStatus.declined
    ) {
      return (
        <CloseDispenseForm
          patientUuid={patientUuid}
          medicationDispense={medicationDispense}
          mode="edit"
          mutate={() => {
            mutate();
            mutatePrescriptionDetails();
          }}
        />
      );
    }
  };

  const generateOverlayText: Function = (
    medicationDispense: MedicationDispense
  ) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t("editDispenseRecord", "Edit Dispense Record");
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t("editPauseRecord", "Edit Pause Record");
    } else if (
      medicationDispense.status === MedicationDispenseStatus.declined
    ) {
      return t("editCloseeRecord", "Edit Close Record");
    }
  };

  const generateMedicationDispenseActionMenu: Function = (
    medicationDispense: MedicationDispense
  ) => {
    const editable = userCanEdit(session);
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
                  generateOverlayText(medicationDispense),
                  generateForm(
                    medicationDispense,
                    mutate,
                    mutatePrescriptionDetails
                  )
                )
              }
              itemText={t("editRecord", "Edit Record")}
            ></OverflowMenuItem>
          )}
          {deletable && (
            <OverflowMenuItem
              onClick={() => {
                handleDelete(medicationDispense);
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

  const handleDelete: Function = (medicationDispense: MedicationDispense) => {
    // if this is the most recent dispense event that we are deleting, have to update the fulfiller status
    // on the request
    // TODO extract out into an resource or a util?
    if (isMostRecentMedicationDispenseStatus(medicationDispense, dispenses)) {
      const status = getNextMostRecentMedicationDispenseStatus(dispenses);
      let updatedFulfillerStatus: MedicationRequestFulfillerStatus = null;
      if (status !== null && status === MedicationDispenseStatus.declined) {
        updatedFulfillerStatus = MedicationRequestFulfillerStatus.declined;
      } else if (
        status !== null &&
        status == MedicationDispenseStatus.on_hold
      ) {
        updatedFulfillerStatus = MedicationRequestFulfillerStatus.on_hold;
      }
      updateMedicationRequestFulfillerStatus(
        getUuidFromReference(
          medicationDispense.authorizingPrescription[0].reference // assumes authorizing prescription exist
        ),
        updatedFulfillerStatus
      ).then(() => {
        mutate();
        mutatePrescriptionDetails();
      });
    }

    deleteMedicationDispense(medicationDispense.id).then(() => {
      mutate();
      mutatePrescriptionDetails();
    });
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
