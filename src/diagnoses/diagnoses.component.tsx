import { InlineLoading, InlineNotification, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientDiagnosis } from './diagnoses.resource';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Layer,
} from '@carbon/react';
import styles from './diagnoses.scss';

type PatientDiagnosesProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientDiagnoses: React.FC<PatientDiagnosesProps> = ({ encounterUuid, patientUuid }) => {
  const { diagnoses, isLoading, error, showDiagnosesFromVisit } = usePatientDiagnosis(encounterUuid);

  const { t } = useTranslation();

  if (!showDiagnosesFromVisit) return null;

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
    <Layer className={styles.diagnosesContainer}>
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>
              {t('diagnoses', 'Diagnoses')} {diagnoses.length ? `(${diagnoses.length})` : ''}
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          <StructuredListRow>
            <StructuredListCell noWrap>{t('confirmedDiagnoses', 'Confirm diagnoses')}</StructuredListCell>
            <StructuredListCell>
              {diagnoses.map(({ text }, index) => (
                <Tag key={index}>{text}</Tag>
              ))}
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PatientDiagnoses;
