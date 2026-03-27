import React from 'react';
import { SkeletonText, Tile } from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { type PatientUuid, useConfig } from '@openmrs/esm-framework';
import { getConceptCodingDisplay } from '../utils';
import { type AllergyIntolerance } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { usePatientAllergies } from '../medication-request/medication-request.resource';
import styles from './prescription-details.scss';

const PrescriptionDetails: React.FC<{
  patientUuid: PatientUuid;
  displayMode?: 'tile' | 'inline';
}> = ({ patientUuid, displayMode = 'tile' }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const {
    allergies,
    totalAllergies,
    isLoading: isLoadingAllergies,
    error: allergiesError,
  } = usePatientAllergies(patientUuid, config.refreshInterval);

  const displayAllergies = (allergies: Array<AllergyIntolerance>): string => {
    const fallbackLabel = t('unknownAllergy', 'Unknown allergy');
    return allergies
      .map((allergy) => {
        // Prefer code.text as it contains the human-readable allergen name
        // (especially important for "Other" type allergies where coding display is generic)
        if (allergy.code?.text) {
          return allergy.code.text;
        }
        if (allergy.code?.coding?.length) {
          return getConceptCodingDisplay(allergy.code.coding) ?? allergy.code.coding[0]?.display;
        }
        return fallbackLabel;
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className={displayMode === 'inline' ? styles.prescriptionInlineContainer : styles.prescriptionContainer}>
      {isLoadingAllergies && (
        <Tile className={displayMode === 'inline' ? styles.inlineSkeletonTile : styles.skeletonTile}>
          <SkeletonText />
        </Tile>
      )}
      {!isLoadingAllergies && (
        <Tile className={displayMode === 'inline' ? styles.inlineAllergiesTile : styles.allergiesTile}>
          <div className={styles.allergiesContent}>
            <div>
              <WarningFilled size={24} className={styles.allergiesIcon} />
              <p>
                {allergiesError && (
                  <span className={styles.error}>
                    {t('errorLoadingAllergies', 'Error loading allergies')}: {allergiesError.message}
                  </span>
                )}
                {!allergiesError && totalAllergies > 0 && (
                  <span>
                    <span className={styles.allergiesCount}>
                      {t('allergiesCount', '{{ count }} allergies', {
                        count: totalAllergies,
                      })}
                    </span>{' '}
                    {displayAllergies(allergies)}
                  </span>
                )}
                {!allergiesError &&
                  typeof totalAllergies === 'number' &&
                  totalAllergies === 0 &&
                  t('noAllergyDetailsFound', 'No allergy details found')}
              </p>
            </div>
          </div>
        </Tile>
      )}
    </div>
  );
};

export default PrescriptionDetails;
