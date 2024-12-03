import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import {
  formatDate,
  useConfig,
  useSession,
  PageHeader,
  PageHeaderContent,
  PharmacyPictogram,
} from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import styles from './pharmacy-header.scss';

export const PharmacyHeader: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <PageHeader className={styles.header}>
      <PageHeaderContent illustration={<PharmacyPictogram />} title={t('appName', config.appName)} />
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </PageHeader>
  );
};
