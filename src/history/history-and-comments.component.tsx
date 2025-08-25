import React from 'react';
import { DataTableSkeleton, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  formatDatetime,
  launchWorkspace,
  parseDate,
  type Session,
  showModal,
  showSnackbar,
  useConfig,
  userHasAccess,
  useSession,
} from '@openmrs/esm-framework';
import styles from './history-and-comments.scss';
import {
  updateMedicationRequestFulfillerStatus,
  usePrescriptionDetails,
} from '../medication-request/medication-request.resource';
import { deleteMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import MedicationEvent from '../components/medication-event.component';
import { type MedicationDispense, MedicationDispenseStatus, type MedicationRequestBundle } from '../types';
import {
  PRIVILEGE_DELETE_DISPENSE,
  PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
  PRIVILEGE_EDIT_DISPENSE,
} from '../constants';
import {
  computeNewFulfillerStatusAfterDelete,
  computeQuantityRemaining,
  getFulfillerStatus,
  getMedicationRequestBundleContainingMedicationDispense,
  getUuidFromReference,
  revalidate,
  sortMedicationDispensesByWhenHandedOver,
  computeTotalQuantityDispensed,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  patientUuid: string;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const session = useSession();
  const config = useConfig<PharmacyConfig>();
  const { medicationRequestBundles, prescriptionDate, error, isLoading } = usePrescriptionDetails(
    encounterUuid,
    config.refreshInterval,
  );

  const userCanEdit: Function = (session: Session) =>
    session?.user && userHasAccess(PRIVILEGE_EDIT_DISPENSE, session.user);

  const userCanDelete: Function = (session: Session, medicationDispense: MedicationDispense) => {
    if (session?.user) {
      if (userHasAccess(PRIVILEGE_DELETE_DISPENSE, session.user)) {
        return true;
      } else if (
        userHasAccess(PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY, session.user) &&
        session.currentProvider?.uuid &&
        medicationDispense.performer?.find(
          (performer) =>
            performer?.actor?.reference?.length > 1 &&
            performer.actor.reference.split('/')[1] === session.currentProvider.uuid,
        ) !== null
      ) {
        return true;
      }
    }
    return false;
  };

  const getDispenseWorkspaceConfig: Function = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      // note that since this is an edit, quantity remaining needs to include quantity that is part of this dispense
      let quantityRemaining = null;
      if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
        quantityRemaining =
          computeQuantityRemaining(medicationRequestBundle) +
          (medicationDispense?.quantity ? medicationDispense.quantity.value : 0);
      }

      let quantityDispensed = 0;
      if (medicationRequestBundle.dispenses) {
        quantityDispensed = computeTotalQuantityDispensed(medicationRequestBundle.dispenses);
      }

      const dispenseFormProps = {
        patientUuid,
        encounterUuid,
        medicationDispense,
        medicationRequestBundle,
        quantityRemaining,
        quantityDispensed,
        mode: 'edit',
      };

      return { workspaceName: 'dispense-workspace', props: dispenseFormProps };
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      const pauseDispenseFormProps = {
        patientUuid,
        encounterUuid,
        medicationDispense,
        mode: 'edit',
      };
      return { workspaceName: 'pause-dispense-workspace', props: pauseDispenseFormProps };
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      const closeDispenseFormProps = {
        patientUuid,
        encounterUuid,
        medicationDispense,
        mode: 'edit',
      };
      return { workspaceName: 'close-dispense-workspace', props: closeDispenseFormProps };
    }
  };

  const getWorkspaceTitle: Function = (medicationDispense: MedicationDispense) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t('editDispenseRecord', 'Edit Dispense Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t('editPauseRecord', 'Edit Pause Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      return t('editCloseRecord', 'Edit Close Record');
    }
  };

  const generateMedicationDispenseActionMenu: Function = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ) => {
    const editable = userCanEdit(session);
    const deletable = userCanDelete(session, medicationDispense);

    const handleEdit = () => {
      const { workspaceName, props } = getDispenseWorkspaceConfig(medicationDispense, medicationRequestBundle) as {
        workspaceName: string;
        props: Record<string, unknown>;
      };
      const workspaceTitle = getWorkspaceTitle(medicationDispense);
      launchWorkspace(workspaceName, { workspaceTitle, ...props });
    };
    const handleDeleteClick = ({ medicationDispense, medicationRequestBundle }) => {
      const dispose = showModal('delete-confirm-modal', {
        title: t('deleteDispenseRecord', 'Delete Dispense Record'),
        message: t('deleteDispenseRecordMessage', 'Are you sure you want to delete this dispense record?'),
        onDelete: () => {
          handleDelete(medicationDispense, medicationRequestBundle);
          dispose();
        },
        onClose: () => {
          dispose();
        },
      });
    };

    if (!editable && !deletable) {
      return null;
    } else {
      return (
        <OverflowMenu
          aria-label={t('medicationDispenseActionMenu', 'Medication Dispense Action Menu')}
          className={styles.medicationEventActionMenu}
          flipped>
          {editable && (
            <OverflowMenuItem
              className={styles.menuitem}
              itemText={t('editRecord', 'Edit record')}
              onClick={handleEdit}
            />
          )}
          {deletable && (
            <OverflowMenuItem
              className={styles.menuitem}
              hasDivider
              isDelete
              itemText={t('delete', 'Delete')}
              onClick={() => handleDeleteClick({ medicationDispense, medicationRequestBundle })}
            />
          )}
        </OverflowMenu>
      );
    }
  };

  const generateDispenseTag: Function = (medicationDispense: MedicationDispense) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return <Tag type="gray">{t('dispensed', 'Dispensed')}</Tag>;
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return <Tag type="red">{t('paused', 'Paused')}</Tag>;
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      return <Tag type="red">{t('closed', 'Closed')}</Tag>;
    } else {
      return null;
    }
  };

  const generateDispenseVerbiage: Function = (medicationDispense: MedicationDispense) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t('dispensedMedication', 'dispensed medication');
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t('pausedDispense', 'paused dispense');
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      return t('closedDispense', 'closed dispense');
    } else {
      return null;
    }
  };

  const handleDelete: Function = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ) => {
    const currentFulfillerStatus = getFulfillerStatus(medicationRequestBundle.request);
    const newFulfillerStatus = computeNewFulfillerStatusAfterDelete(
      medicationDispense,
      medicationRequestBundle,
      config.dispenseBehavior.restrictTotalQuantityDispensed,
    );

    deleteMedicationDispense(medicationDispense.id)
      .then(() => {
        showSnackbar({
          kind: 'success',
          title: t('success', 'Success'),
          subtitle: t('medicationDispenseDeleted', 'Medication dispense was deleted successfully'),
        });
        if (currentFulfillerStatus !== newFulfillerStatus) {
          updateMedicationRequestFulfillerStatus(
            getUuidFromReference(
              medicationDispense.authorizingPrescription[0].reference, // assumes authorizing prescription exist
            ),
            newFulfillerStatus,
          )
            .then(() => {
              revalidate(encounterUuid);
            })
            .catch(() => {
              showSnackbar({
                kind: 'error',
                title: t('updateStatusFailed', 'Update Status Failed'),
                subtitle: t('couldNotUpdateMedicationRequestStatus', 'Could not update medication request status'),
              });
            });
        }
        revalidate(encounterUuid);
      })
      .catch(() => {
        showSnackbar({
          kind: 'error',
          title: t('deleteFailed', 'Delete Failed'),
          subtitle: t('couldNotDeleteMedicationDispense', 'Could not delete medication dispense'),
        });
      });
  };

  // TODO: assumption is dispenses always are after requests?
  return (
    <div className={styles.historyAndCommentsContainer}>
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {error && <p>{t('error', 'Error')}</p>}
      {medicationRequestBundles &&
        medicationRequestBundles
          .flatMap((medicationDispenseBundle) => medicationDispenseBundle.dispenses)
          .sort(sortMedicationDispensesByWhenHandedOver)
          .map((dispense) => {
            return (
              <div key={dispense.id}>
                <h5
                  style={{
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '0.9rem',
                  }}>
                  {dispense.performer && dispense.performer[0]?.actor?.display} {generateDispenseVerbiage(dispense)} -{' '}
                  {formatDatetime(parseDate(dispense.whenHandedOver))}
                </h5>
                <Tile className={styles.dispenseTile}>
                  <MedicationEvent medicationEvent={dispense} status={generateDispenseTag(dispense)} />
                  {generateMedicationDispenseActionMenu(
                    dispense,
                    getMedicationRequestBundleContainingMedicationDispense(medicationRequestBundles, dispense),
                  )}
                </Tile>
              </div>
            );
          })}
      {medicationRequestBundles &&
        medicationRequestBundles
          .flatMap((medicationRequestBundle) => medicationRequestBundle.request)
          .map((request) => {
            return (
              <div key={request.id}>
                <h5
                  style={{
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '0.9rem',
                  }}>
                  {request.requester.display} {t('orderedMedication ', 'ordered medication')} -{' '}
                  {formatDatetime(prescriptionDate)}
                </h5>
                <Tile className={styles.requestTile}>
                  <MedicationEvent
                    medicationEvent={request}
                    status={<Tag type="green">{t('ordered', 'Ordered')}</Tag>}
                  />
                </Tile>
              </div>
            );
          })}
    </div>
  );
};

export default HistoryAndComments;
