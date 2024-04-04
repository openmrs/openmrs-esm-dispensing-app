import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { useMetrics } from './dispensing-tiles.resource';
import DispensingTile from './dispensing-tile.component';
import styles from './dispensing-tiles.scss';

const DispensingTiles: React.FC = () => {
  const { t } = useTranslation();
  const { metrics, isError, isLoading } = useMetrics();

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <div className={styles.cardContainer}>
        <DispensingTile
          label={t('orders', 'Orders')}
          value={metrics.orders}
          headerLabel={t('prescriptionsToFillToday', 'Prescriptions to fill today')}
        />
        <DispensingTile
          label={t('today', 'Today')}
          value={metrics.orders_for_home_delivery}
          headerLabel={t('ordersForHomeDelivery', 'Orders for home delivery')}
        />
        <DispensingTile
          label={t('last14Days', 'Last 14 days')}
          value={metrics.missed_collections}
          headerLabel={t('missedCollections', 'Missed collections')}
        />
      </div>
    </>
  );
};

export default DispensingTiles;
