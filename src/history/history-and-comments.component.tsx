import React from 'react';
import { DataTableSkeleton, OverflowMenu, OverflowMenuItem, Tag, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate, type Session, useConfig, userHasAccess, useSession } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
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
  getFulfillerStatus,
  getMedicationRequestBundleContainingMedicationDispense,
  getUuidFromReference,
  revalidate,
  sortMedicationDispensesByWhenHandedOver,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import CloseDispenseForm from '../forms/close-dispense-form.component';
import DispenseForm from '../forms/dispense-form.component';
import MedicationEvent from '../components/medication-event.component';
import PauseDispenseForm from '../forms/pause-dispense-form.component';
import styles from './history-and-comments.scss';

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
        ) != null
      ) {
        return true;
      }
    }
    return false;
  };

  const generateForm: Function = (
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

      return (
        <DispenseForm
          patientUuid={patientUuid}
          encounterUuid={encounterUuid}
          medicationDispense={medicationDispense}
          medicationRequestBundle={medicationRequestBundle}
          quantityRemaining={quantityRemaining}
          mode="edit"
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
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
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

  const generateOverlayText: Function = (medicationDispense: MedicationDispense) => {
    if (medicationDispense.status === MedicationDispenseStatus.completed) {
      return t('editDispenseRecord', 'Edit Dispense Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.on_hold) {
      return t('editPauseRecord', 'Edit Pause Record');
    } else if (medicationDispense.status === MedicationDispenseStatus.declined) {
      return t('editCloseeRecord', 'Edit Close Record');
    }
  };

  const generateMedicationDispenseActionMenu: Function = (
    medicationDispense: MedicationDispense,
    medicationRequestBundle: MedicationRequestBundle,
  ) => {
    const editable = userCanEdit(session);
    const deletable = userCanDelete(session, medicationDispense);

    if (!editable && !deletable) {
      return null;
    } else {
      return (
        <OverflowMenu
          ariaLabel={t('medicationDispenseActionMenu', 'Medication Dispense Action Menu')}
          flipped={true}
          className={styles.medicationEventActionMenu}>
          {editable && (
            <OverflowMenuItem
              onClick={() =>
                launchOverlay(
                  generateOverlayText(medicationDispense),
                  generateForm(medicationDispense, medicationRequestBundle),
                )
              }
              itemText={t('editRecord', 'Edit Record')}></OverflowMenuItem>
          )}
          {deletable && (
            <OverflowMenuItem
              onClick={() => {
                handleDelete(medicationDispense, medicationRequestBundle);
              }}
              itemText={t('delete', 'Delete')}></OverflowMenuItem>
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
    if (currentFulfillerStatus !== newFulfillerStatus) {
      updateMedicationRequestFulfillerStatus(
        getUuidFromReference(
          medicationDispense.authorizingPrescription[0].reference, // assumes authorizing prescription exist
        ),
        newFulfillerStatus,
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
                  {generateMedicationDispenseActionMenu(
                    dispense,
                    getMedicationRequestBundleContainingMedicationDispense(medicationRequestBundles, dispense),
                  )}
                  <MedicationEvent medicationEvent={dispense} status={generateDispenseTag(dispense)} />
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
