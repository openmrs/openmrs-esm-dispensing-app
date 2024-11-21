import { InlineLoading, InlineNotification, Tag, Tile } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientDiagnosis } from './diagnoses.resource';

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

  if (!diagnoses?.length) return null;

  return (
    <Tile>
      <strong>
        {t('diagnoses', 'Diagnoses')} {diagnoses.length ? `(${diagnoses.length})` : ''}
      </strong>
      <br />
      {diagnoses.map(({ text }, index) => (
        <Tag key={index}>{text}</Tag>
      ))}
    </Tile>
  );
};

export default PatientDiagnoses;
