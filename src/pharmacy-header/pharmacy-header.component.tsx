import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useConfig, useSession, formatDate } from '@openmrs/esm-framework';
import PharmacyIllustration from './pharmacy-illustration.component';
import { type PharmacyConfig } from '../config-schema';
import styles from './pharmacy-header.scss';

export const PharmacyHeader: React.FC = () => {
  const { t } = useTranslation();
  const userSession = useSession();
  const config = useConfig<PharmacyConfig>();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <PharmacyIllustration />
        <div className={styles['page-labels']}>
          <p>{t('appName', config.appName)}</p>
          <p className={styles['page-name']}>{t('home', 'Home')}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};
