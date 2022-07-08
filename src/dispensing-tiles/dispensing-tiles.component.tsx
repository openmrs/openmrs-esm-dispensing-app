import React from "react";
import { useTranslation } from "react-i18next";
import { DataTableSkeleton } from "carbon-components-react";
import { useMetrics } from "./dispensing-tiles.resource";
import DispensingTile from "./dispensing-tile.component";
import styles from "./dispensing-tiles.scss";

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
          label={t("orders", "Orders")}
          value={metrics ? metrics.orders : 0}
          headerLabel={t(
            "prescriptionsToFillToday",
            "Prescriptions to fill today"
          )}
        />
        <DispensingTile
          label={t("today", "Today")}
          value={metrics ? metrics.orders_for_home_delivery : 0}
          headerLabel={t("ordersForHomeDelivery", "Orders for home delivery")}
        />
        <DispensingTile
          label={t("last14Days", "Last 14 days")}
          value={metrics ? metrics.missed_collections : 0}
          headerLabel={t("missedCollections", "Missed collections")}
        />
      </div>
    </>
  );
};

export default DispensingTiles;
