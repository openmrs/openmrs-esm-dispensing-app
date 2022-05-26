import React from "react";
import { useTranslation } from "react-i18next";
import Calendar16 from "@carbon/icons-react/es/calendar/16";
import Location16 from "@carbon/icons-react/es/location/16";
import { useConfig, useSession, formatDate } from "@openmrs/esm-framework";
import { PharmacyConfig } from "../config-schema";
import PharmacyIllustration from "./pharmacy-illustration.component";
import styles from "./pharmacy-header.scss";

export const PharmacyHeader: React.FC = () => {
  const { t } = useTranslation();
  const userSession = useSession();
  const config = useConfig() as PharmacyConfig;
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles["left-justified-items"]}>
        <PharmacyIllustration />
        <div className={styles["page-labels"]}>
          <Location16 />
          <span className={styles.value}>{userLocation}</span>
          <p className={styles["page-name"]}>{t("appName", config.appName)} </p>
        </div>
      </div>
      <div className={styles["right-justified-items"]}>
        <div className={styles["date-and-location"]}>
          <Calendar16 />
          <span className={styles.value}>
            {formatDate(new Date(), { mode: "standard" })}
          </span>
        </div>
      </div>
    </div>
  );
};
