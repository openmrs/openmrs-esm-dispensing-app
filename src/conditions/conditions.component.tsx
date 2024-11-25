import React from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Layer,
  InlineLoading,
  InlineNotification,
} from '@carbon/react';
import styles from './conditions.scss';
import { useTranslation } from 'react-i18next';
import { usePatientConditions } from './conditions.resource';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import EmptyState from '../components/empty-state.component';

type PatientConditionsProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientConditions: React.FC<PatientConditionsProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const { conditions, error, isLoading, mutate, showPatientConditions } = usePatientConditions(patientUuid);

  if (!showPatientConditions) return null;

  if (isLoading)
    return (
      <InlineLoading
        iconDescription="Loading"
        description={t('loadingConditions', 'Loading Conditions ...')}
        status="active"
      />
    );

  if (error)
    return <InlineNotification kind="error" subtitle={t('conditionsError', 'Error loading conditions')} lowContrast />;

  if (!conditions.length)
    return (
      <EmptyState title={t('conditions', 'Conditions')} message={t('noConditions', 'No conditions for this patient')} />
    );

  return (
    <Layer className={styles.conditionsContainer}>
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>
              {t('activeConditions', 'Active Conditions')}
              {`(${conditions.length})`}
            </StructuredListCell>
            <StructuredListCell head>{t('onSetDate', 'Onset Date')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {conditions.map(({ display, onsetDateTime, status }) => (
            <StructuredListRow>
              <StructuredListCell noWrap>{display}</StructuredListCell>
              <StructuredListCell>{formatDate(parseDate(onsetDateTime))}</StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PatientConditions;
