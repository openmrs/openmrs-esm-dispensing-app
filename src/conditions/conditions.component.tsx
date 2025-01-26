import { InlineLoading, InlineNotification, Tag, Tile } from '@carbon/react';
import { formatDate, InformationIcon, parseDate } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientConditions } from './conditions.resource';
import styles from './conditions.scss';

type PatientConditionsProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientConditions: React.FC<PatientConditionsProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const { conditions, error, isLoading, mutate } = usePatientConditions(patientUuid);

  const tablerows = useMemo(() => {
    return (conditions ?? []).map((c) => ({ ...c, onsetDateTime: formatDate(parseDate(c.onsetDateTime)) }));
  }, [conditions]);

  if (isLoading)
    return (
      <InlineLoading
        iconDescription="Loading"
        description={t('loadingConditions', 'Loading active Conditions ...')}
        status="active"
      />
    );

  if (error)
    return <InlineNotification kind="error" subtitle={t('conditionsError', 'Error loading conditions')} lowContrast />;

  if (!conditions.length)
    return (
      <Tile className={styles.emptyState}>
        <InformationIcon />
        <strong>{t('noActiveConditions', 'No active Conditions')}</strong>
      </Tile>
    );

  return (
    <Tile>
      <h5>{t('activeConditions', 'Active conditions')}</h5>
      <div>{conditions?.map(({ id, display }) => <Tag key={id}>{display}</Tag>)}</div>
    </Tile>
  );
};

export default PatientConditions;
