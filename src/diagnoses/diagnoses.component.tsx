import { InlineLoading, InlineNotification, Tag, Tile } from '@carbon/react';
import { InformationIcon } from '@openmrs/esm-framework';
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

  if (!diagnoses.length)
    return (
      <Tile className={styles.emptyState}>
        <InformationIcon />
        <strong>{t('noFinalDiagnoses', 'No patient final diagnosis for this visit')}</strong>
      </Tile>
    );
  return (
    <Tile>
      <h5>{t('finalDiagnoses', 'Visit Final Diagnoses')}</h5>
      <div>{diagnoses?.map(({ id, text }) => <Tag key={id}>{text}</Tag>)}</div>
    </Tile>
  );
};

export default PatientDiagnoses;
