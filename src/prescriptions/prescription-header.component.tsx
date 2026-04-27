import React from 'react';
import { SkeletonText, Tag, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type PatientUuid, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import { PRIVILEGE_CREATE_DISPENSE } from '../constants';
import { usePrescriptionDetails } from '../medication-request/medication-request.resource';
import ActionButtons from '../components/action-buttons.component';
import MedicationEvent from '../components/medication-event.component';
import { computeMedicationRequestCombinedStatus, useStaleEncounterUuids } from '../utils';
import { type MedicationRequest, MedicationRequestCombinedStatus } from '../types';
import PrescriptionsActionsFooter from './prescription-actions.component';
import PrescriptionDetails from './prescription-details.component';
import styles from './prescription-details.scss';

const PrescriptionHeader: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const { medicationRequestBundles, error, isLoading } = usePrescriptionDetails(encounterUuid, config.refreshInterval);
  const { staleEncounterUuids } = useStaleEncounterUuids();

  const generateStatusTag = (medicationRequest: MedicationRequest): React.ReactNode => {
    const combinedStatus: MedicationRequestCombinedStatus = computeMedicationRequestCombinedStatus(
      medicationRequest,
      config.medicationRequestExpirationPeriodInDays,
    );
    if (combinedStatus === MedicationRequestCombinedStatus.cancelled) {
      return <Tag type="red">{t('cancelled', 'Cancelled')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.completed) {
      return <Tag type="green">{t('completed', 'Completed')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.expired) {
      return <Tag type="red">{t('expired', 'Expired')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.declined) {
      return <Tag type="red">{t('closed', 'Closed')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.on_hold) {
      return <Tag type="red">{t('paused', 'Paused')}</Tag>;
    }

    return null;
  };

  return (
    <>
      <div className={styles.prescribedSummaryRow}>
        <h5 className={styles.prescribedSummaryLabel}>{t('prescribed', 'Prescribed')}:</h5>
        <PrescriptionDetails patientUuid={patientUuid} displayMode="inline" />
      </div>
      {isLoading && (
        <Tile className={styles.skeletonTile}>
          <SkeletonText paragraph lineCount={2} />
        </Tile>
      )}
      {error && (
        <p className={styles.error}>
          {t('errorLoadingPrescriptionDetails', 'Error loading prescription details')}: {error.message}
        </p>
      )}
      {medicationRequestBundles &&
        (medicationRequestBundles.length > 0 ? (
          medicationRequestBundles.map((bundle) => (
            <MedicationEvent
              key={bundle.request.id}
              medicationEvent={bundle.request}
              status={generateStatusTag(bundle.request)}>
              <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
                <ActionButtons
                  patientUuid={patientUuid}
                  encounterUuid={encounterUuid}
                  medicationRequestBundle={bundle}
                  disabled={staleEncounterUuids.includes(encounterUuid)}
                />
              </UserHasAccess>
            </MedicationEvent>
          ))
        ) : (
          <p className={styles.emptyState}>{t('noPrescriptionsFound', 'No prescriptions found')}</p>
        ))}
      {medicationRequestBundles?.length > 0 && (
        <PrescriptionsActionsFooter encounterUuid={encounterUuid} patientUuid={patientUuid} />
      )}
    </>
  );
};

export default PrescriptionHeader;
