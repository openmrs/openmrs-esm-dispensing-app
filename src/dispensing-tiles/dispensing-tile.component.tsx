import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import styles from './dispensing-tile.scss';

interface DispensingTileProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
}

const DispensingTile: React.FC<DispensingTileProps> = ({ label, value, headerLabel, children }) => {
  const { t } = useTranslation();

  return (
    <ResponsiveWrapper>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} className={styles.arrowIcon} />}
            iconDescription={t('view', 'View')}>
            {t('view', 'View')}
          </Button>
        </div>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
      </Tile>
    </ResponsiveWrapper>
  );
};

export default DispensingTile;
