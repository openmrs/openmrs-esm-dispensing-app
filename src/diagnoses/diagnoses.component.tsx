import React from 'react';
import { usePatientDiagnosis } from './diagnoses.resource';
import { InlineLoading, InlineNotification, Tile, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';

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
    <Tile>
      <strong>Diagnoses {diagnoses.length ? `(${diagnoses.length})` : ''}</strong>
      <br />
      {diagnoses.length ? (
        <>
          {diagnoses.map(({ text }, index) => (
            <Tag key={index}>{text}</Tag>
          ))}
        </>
      ) : (
        'No diagnoses found'
      )}
    </Tile>
  );
};

export default PatientDiagnoses;
