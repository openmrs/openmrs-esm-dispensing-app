import { DataTableSkeleton, Tag, Tile } from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import { type PatientUuid, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionButtons from '../components/action-buttons.component';
import MedicationEvent from '../components/medication-event.component';
import { type PharmacyConfig } from '../config-schema';
import { PRIVILEGE_CREATE_DISPENSE } from '../constants';
import { usePatientAllergies, usePrescriptionDetails } from '../medication-request/medication-request.resource';
import {
  type AllergyIntolerance,
  MedicationRequestCombinedStatus,
  type MedicationRequestBundle,
  MedicationDispenseStatus,
} from '../types';
import {
  computeMedicationRequestCombinedStatus,
  getConceptCodingDisplay,
  getMostRecentMedicationDispenseStatus,
} from '../utils';
import PrescriptionsActionsFooter from './prescription-actions.component';
import styles from './prescription-details.scss';

const PrescriptionDetails: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const [isAllergiesLoading, setAllergiesLoadingStatus] = useState(true);
  const { allergies, totalAllergies } = usePatientAllergies(patientUuid, config.refreshInterval);
  const { medicationRequestBundles, error, isLoading } = usePrescriptionDetails(encounterUuid, config.refreshInterval);

  useEffect(() => {
    if (typeof totalAllergies == 'number') {
      setAllergiesLoadingStatus(false);
    }
  }, [totalAllergies]);

  const generateStatusTag: Function = (medicationRequestBundle: MedicationRequestBundle) => {
    const combinedStatus: MedicationRequestCombinedStatus = computeMedicationRequestCombinedStatus(
      medicationRequestBundle.request,
      config.medicationRequestExpirationPeriodInDays,
    );

    const mostRecentDispenseStatus = getMostRecentMedicationDispenseStatus(medicationRequestBundle.dispenses);
    if (mostRecentDispenseStatus === MedicationDispenseStatus.completed) {
      return <Tag type="gray">{t('dispensed', 'Dispensed')}</Tag>;
    }

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

  const displayAllergies: Function = (allergies: Array<AllergyIntolerance>) => {
    // TODO: Use the `text` property for non-coded allergies
    return allergies.map((allergy) => getConceptCodingDisplay(allergy.code.coding)).join(', ');
  };

  return (
    <div className={styles.prescriptionContainer}>
      {isAllergiesLoading && <DataTableSkeleton role="progressbar" />}
      {!isAllergiesLoading && (
        <Tile className={styles.allergiesTile}>
          <div className={styles.allergiesContent}>
            <div>
              <WarningFilled size={24} className={styles.allergiesIcon} />
              <p>
                {totalAllergies > 0 && (
                  <span>
                    <span style={{ fontWeight: 'bold' }}>
                      {t('allergiesCount', '{{ count }} allergies', {
                        count: totalAllergies,
                      })}
                    </span>{' '}
                    {displayAllergies(allergies)}
                  </span>
                )}
                {totalAllergies === 0 && t('noAllergyDetailsFound', 'No allergy details found')}
              </p>
            </div>
          </div>
        </Tile>
      )}
      <h5 style={{ paddingTop: '8px', paddingBottom: '8px', fontSize: '0.9rem' }}>{t('prescribed', 'Prescribed')}</h5>
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {error && <p>{t('error', 'Error')}</p>}
      {medicationRequestBundles &&
        medicationRequestBundles.map((bundle) => {
          return (

            <Tile className={styles.prescriptionTile}>

            <Tile key={bundle.request.id} className={styles.prescriptionTile}>
              <MedicationEvent
                key={bundle.request.id}
                medicationEvent={bundle.request}
                status={generateStatusTag(bundle)}
              />
              
              <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
                <ActionButtons
                  patientUuid={patientUuid}
                  encounterUuid={encounterUuid}
                  medicationRequestBundle={bundle}
                />
              </UserHasAccess>
              <MedicationEvent
                key={bundle.request.id}
                medicationEvent={bundle.request}
                status={generateStatusTag(bundle.request)}
              />
            </Tile>
          );
        })}
      <PrescriptionsActionsFooter encounterUuid={encounterUuid} patientUuid={patientUuid} />
    </div>
  );
};

export default PrescriptionDetails;
