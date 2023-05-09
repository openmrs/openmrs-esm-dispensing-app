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
  useConfig,
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
import { PharmacyConfig } from "../config-schema";
import DispenseForm from "../forms/dispense-form.component";
import { MedicationDispense, MedicationDispenseStatus } from "../types";
import {
  PRIVILEGE_DELETE_DISPENSE,
  PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
  PRIVILEGE_EDIT_DISPENSE,
} from "../constants";
import {
  computeNewFulfillerStatusAfterDelete,
  computeQuantityRemaining,
  getAssociatedMedicationDispenses,
  getAssociatedMedicationRequest,
  getDateRecorded,
  getFulfillerStatus,
  getNextMostRecentMedicationDispenseStatus,
  getUuidFromReference,
  isMostRecentMedicationDispense,
  revalidate,
} from "../utils";
import PauseDispenseForm from "../forms/pause-dispense-form.component";
import CloseDispenseForm from "../forms/close-dispense-form.component";

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  patientUuid: string;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const session = useSession();
  const config = useConfig() as PharmacyConfig;
  const { requests, dispenses, prescriptionDate, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);

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

  const generateForm: Function = (medicationDispense: MedicationDispense) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      // fetch the appropriate requests and associated dispense so we can calculate quantity
      const associatedMedicationRequest = getAssociatedMedicationRequest(
        medicationDispense,
        requests
      );
      const associatedMedicationDispenses = getAssociatedMedicationDispenses(
        associatedMedicationRequest,
        dispenses
      );

      // note that since this is an edit, quantity remaining needs to include quantity that is part of this dispense
      let quantityRemaining = null;
      if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
        quantityRemaining =
          computeQuantityRemaining(
            associatedMedicationRequest,
            associatedMedicationDispenses
          ) +
          (medicationDispense?.quantity
            ? medicationDispense.quantity.value
            : 0);
      }

      return (
        <DispenseForm
          patientUuid={patientUuid}
          encounterUuid={encounterUuid}
          medicationDispense={medicationDispense}
          quantityRemaining={quantityRemaining}
          currentFulfillerStatus={getFulfillerStatus(
            associatedMedicationRequest
          )}
          mode="edit"
          isMostRecentDispense={isMostRecentMedicationDispense(
            medicationDispense,
            associatedMedicationDispenses
          )}
        />
      );
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return (
        <PauseDispenseForm
          patientUuid={patientUuid}
          encounterUuid={encounterUuid}
          medicationDispense={medicationDispense}
          mode="edit"
        />
      );
    } else if (
      medicationDispense.status === MedicationDispenseStatus.declined
    ) {
      return (
        <CloseDispenseForm
          patientUuid={patientUuid}
          encounterUuid={encounterUuid}
          medicationDispense={medicationDispense}
          mode="edit"
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
                  generateForm(medicationDispense)
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
    const associatedMedicationRequest = getAssociatedMedicationRequest(
      medicationDispense,
      requests
    );
    const associatedMedicationDispenses = getAssociatedMedicationDispenses(
      associatedMedicationRequest,
      dispenses
    );
    const currentFulfillerStatus = getFulfillerStatus(
      associatedMedicationRequest
    );
    const nextMostRecentDispenseStatus =
      getNextMostRecentMedicationDispenseStatus(associatedMedicationDispenses);
    const isMostRecentDispense = isMostRecentMedicationDispense(
      medicationDispense,
      associatedMedicationDispenses
    );
    const newFulfillerStatus = computeNewFulfillerStatusAfterDelete(
      isMostRecentDispense,
      currentFulfillerStatus,
      medicationDispense.status,
      nextMostRecentDispenseStatus
    );
    if (currentFulfillerStatus !== newFulfillerStatus) {
      updateMedicationRequestFulfillerStatus(
        getUuidFromReference(
          medicationDispense.authorizingPrescription[0].reference // assumes authorizing prescription exist
        ),
        newFulfillerStatus
      ).then(() => {
        revalidate(encounterUuid);
      });
    }
    // do the actual delete
    deleteMedicationDispense(medicationDispense.id).then(() => {
      revalidate(encounterUuid);
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
