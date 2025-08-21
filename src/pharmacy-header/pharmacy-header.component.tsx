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
      <div className={styles.leftJustifiedItems}>
        <PharmacyIllustration />
        <div className={styles.pageLabels}>
          <p>{t('appName', config.appName)}</p>
          <p className={styles.pageName}>{t('home', 'Home')}</p>
        </div>
      </div>
      <div className={styles.rightJustifiedItems}>
        <div className={styles.dateAndLocation}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { noToday: true })}</span>
        </div>
      </div>
    </div>
  );
};
