import { InlineLoading, InlineNotification, Tile } from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import React from 'react';
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

  return (
    <Tile className={styles.conditionContainer}>
      <div className={styles.content}>
        <div>
          <WarningFilled size={24} className={styles.icon} />
          <p>
            {conditions.length > 0 && (
              <span>
                <span style={{ fontWeight: 'bold' }}>
                  {t('activeConditionsCount', '{{ count }} conditions', {
                    count: conditions.length,
                  })}
                </span>{' '}
                {conditions?.map(({ display }) => display).join(', ')}
              </span>
            )}
            {conditions.length === 0 && t('noActiveConditions', 'No active Conditions')}
          </p>
        </div>
      </div>
    </Tile>
  );
};

export default PatientConditions;
