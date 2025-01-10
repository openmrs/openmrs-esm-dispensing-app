import { InlineLoading, InlineNotification ,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Layer,
} from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientDiagnosis } from './diagnoses.resource';
import styles from './diagnoses.scss';
import EmptyState from '../components/empty-state.component';

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
      <EmptyState
        title={t('diagnoses', 'Diagnoses')}
        message={t('noDiagnoses', "No diagnoses for this patient's visit")}
      />
    );

  return (
    <Layer className={styles.diagnosesContainer}>
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>
              {t('diagnoses', 'Diagnoses')} {`(${diagnoses.length})`}
            </StructuredListCell>
            <StructuredListCell head>{t('status', 'Status')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {diagnoses.map(({ certainty, text }) => (
            <StructuredListRow>
              <StructuredListCell noWrap>{text}</StructuredListCell>
              <StructuredListCell>{certainty}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PatientDiagnoses;
