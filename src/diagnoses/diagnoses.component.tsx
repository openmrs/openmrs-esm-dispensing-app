import { InlineLoading, InlineNotification, Tile } from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientDiagnosis } from './diagnoses.resource';
import styles from './diagnoses.scss';

type PatientDiagnosesProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientDiagnoses: React.FC<PatientDiagnosesProps> = ({ encounterUuid, patientUuid }) => {
  const { diagnoses, isLoading, error } = usePatientDiagnosis(encounterUuid);
  const { t } = useTranslation();

  if (isLoading)
    return (
      <InlineLoading
        iconDescription="Loading"
        description={t('loadingDiagnoses', 'Loading Diagnoses ...')}
        status="active"
      />
    );

  if (error)
    return <InlineNotification kind="error" subtitle={t('diagnosesError', 'Error loading diagnoses')} lowContrast />;

  return (
    <Tile className={styles.diagnosesContainer}>
      <div className={styles.content}>
        <div>
          <WarningFilled size={24} className={styles.icon} />
          <p>
            {diagnoses.length > 0 && (
              <span>
                <span style={{ fontWeight: 'bold' }}>
                  {t('diagnosesCount', '{{ count }} diagnoses', {
                    count: diagnoses.length,
                  })}
                </span>{' '}
                {diagnoses?.map(({ text }) => text).join(', ')}
              </span>
            )}
            {diagnoses.length === 0 && t('noFinalDiagnoses', 'No patient final diagnosis for this visit')}
          </p>
        </div>
      </div>
    </Tile>
  );
};

export default PatientDiagnoses;
