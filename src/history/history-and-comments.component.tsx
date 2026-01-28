import React, { useMemo } from 'react';
import { OverflowMenu, OverflowMenuItem, SkeletonText, Tag, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  formatDatetime,
  launchWorkspace2,
  parseDate,
  type Session,
  showModal,
  showSnackbar,
  useConfig,
  userHasAccess,
  useSession,
} from '@openmrs/esm-framework';
import {
  updateMedicationRequestFulfillerStatus,
  usePrescriptionDetails,
} from '../medication-request/medication-request.resource';
import { deleteMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import { type MedicationDispense, MedicationDispenseStatus, type MedicationRequestBundle } from '../types';
import {
  PRIVILEGE_DELETE_DISPENSE,
  PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY,
  PRIVILEGE_EDIT_DISPENSE,
} from '../constants';
import {
  computeNewFulfillerStatusAfterDelete,
  computeQuantityRemaining,
  computeTotalQuantityDispensed,
  getFulfillerStatus,
  getMedicationRequestBundleContainingMedicationDispense,
  getUuidFromReference,
  markEncounterAsStale,
  revalidate,
  sortMedicationDispensesByWhenHandedOver,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import MedicationEvent from '../components/medication-event.component';
import styles from './history-and-comments.scss';

const HistoryAndComments: React.FC<{
  encounterUuid: string;
  patientUuid: string;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const { medicationRequestBundles, prescriptionDate, error, isLoading } = usePrescriptionDetails(
    encounterUuid,
    config.refreshInterval,
  );

  const generateDispenseVerbiage = (medicationDispense: MedicationDispense): string | null => {
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

  const { sortedDispenses, requests, hasHistory } = useMemo(() => {
    const dispenses = medicationRequestBundles?.flatMap((bundle) => bundle.dispenses) ?? [];
    const requests = medicationRequestBundles?.flatMap((bundle) => bundle.request) ?? [];
    return {
      sortedDispenses: [...dispenses].sort(sortMedicationDispensesByWhenHandedOver),
      requests,
      hasHistory: dispenses.length > 0 || requests.length > 0,
    };
  }, [medicationRequestBundles]);

  return (
    <div className={styles.historyAndCommentsContainer}>
      {isLoading && (
        <Tile>
          <SkeletonText paragraph lineCount={2} />
        </Tile>
      )}
      {error && (
        <p className={styles.error}>
          {t('errorLoadingHistory', 'Error loading history')}: {error.message}
        </p>
      )}
      {!isLoading && !error && !hasHistory && (
        <p className={styles.emptyState}>{t('noHistoryFound', 'No history found')}</p>
      )}
      {!isLoading && !error && hasHistory && (
        <>
          {sortedDispenses.map((dispense) => (
            <div key={dispense.id}>
              <h5 className={styles.historyHeader}>
                {dispense.performer && dispense.performer[0]?.actor?.display} {generateDispenseVerbiage(dispense)} -{' '}
                {formatDatetime(parseDate(dispense.whenHandedOver))}
              </h5>
              <MedicationEvent
                medicationEvent={dispense}
                status={<DispenseTag medicationDispense={dispense} />}
                isDispenseEvent>
                <MedicationDispenseActionMenu
                  medicationDispense={dispense}
                  medicationRequestBundle={getMedicationRequestBundleContainingMedicationDispense(
                    medicationRequestBundles,
                    dispense,
                  )}
                  patientUuid={patientUuid}
                  encounterUuid={encounterUuid}
                />
              </MedicationEvent>
            </div>
          ))}
          {requests.map((request) => (
            <div key={request.id}>
              <h5 className={styles.historyHeader}>
                {request.requester.display} {t('orderedMedication', 'ordered medication')} -{' '}
                {formatDatetime(prescriptionDate)}
              </h5>
              <MedicationEvent medicationEvent={request} status={<Tag type="green">{t('ordered', 'Ordered')}</Tag>} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
interface MedicationDispenseActionMenuProps {
  medicationDispense: MedicationDispense;
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
}

const MedicationDispenseActionMenu: React.FC<MedicationDispenseActionMenuProps> = ({
  medicationDispense,
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const config = useConfig<PharmacyConfig>();
  const userCanEdit = (session: Session): boolean =>
    session?.user && userHasAccess(PRIVILEGE_EDIT_DISPENSE, session.user);

  const userCanDelete = (session: Session, medicationDispense: MedicationDispense): boolean => {
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
        ) !== undefined
      ) {
        return true;
      }
    }
    return false;
  };

  const getDispenseWorkspaceConfig = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ): { workspaceName: string; props: Record<string, unknown> } | undefined => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      // note that since this is an edit, quantity remaining needs to include quantity that is part of this dispense
      let quantityRemaining = null;
      let quantityDispensed = null;
      if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
        quantityRemaining =
          computeQuantityRemaining(medicationRequestBundle) +
          (medicationDispense?.quantity ? medicationDispense.quantity.value : 0);
        if (medicationRequestBundle.dispenses) {
          quantityDispensed = computeTotalQuantityDispensed(medicationRequestBundle.dispenses);
        }
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

  const getWorkspaceTitle = (medicationDispense: MedicationDispense): string | undefined => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t('editDispenseRecord', 'Edit Dispense Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t('editPauseRecord', 'Edit Pause Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      return t('editCloseRecord', 'Edit Close Record');
    }
  };

  const handleDelete = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ): void => {
    const currentFulfillerStatus = getFulfillerStatus(medicationRequestBundle.request);
    const newFulfillerStatus = computeNewFulfillerStatusAfterDelete(
      medicationDispense,
      medicationRequestBundle,
      config.dispenseBehavior.restrictTotalQuantityDispensed,
    );
    markEncounterAsStale(encounterUuid);
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

  const editable = userCanEdit(session);
  const deletable = userCanDelete(session, medicationDispense);

  const handleEdit = () => {
    const { workspaceName, props } = getDispenseWorkspaceConfig(medicationDispense, medicationRequestBundle) as {
      workspaceName: string;
      props: Record<string, unknown>;
    };
    const customWorkspaceTitle = getWorkspaceTitle(medicationDispense);
    launchWorkspace2(workspaceName, { customWorkspaceTitle, ...props });
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

const DispenseTag: React.FC<{ medicationDispense: MedicationDispense }> = ({ medicationDispense }) => {
  const { t } = useTranslation();

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

export default HistoryAndComments;
