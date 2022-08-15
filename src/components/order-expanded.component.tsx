import React from "react";
import { PatientUuid } from "@openmrs/esm-framework";
import { Tab, Tabs } from "carbon-components-react";
import { useTranslation } from "react-i18next";
import HistoryAndComments from "./history-and-comments.component";
import styles from "./order-expanded.scss";
import PatientDetails from "./patient-details.component";
import PrescriptionDetails from "./prescription-details.component";

interface TabItem {
  name: string;
  component: JSX.Element;
}

const OrderExpanded: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t("prescriptionDetails", "Prescription details"),
      component: <PrescriptionDetails encounterUuid={encounterUuid} />,
    },
    {
      name: t("historyComments", "History and comments"),
      component: <HistoryAndComments />,
    },
    {
      name: t("patientDetails", "Patient details"),
      component: <PatientDetails patientUuid={patientUuid} />,
    },
    // {
    //   name: t("billing", "Billing"),
    //   component: <div>Billing</div>,
    // },
  ];

  return (
    <div className={styles.expandedContainer}>
      <Tabs className={styles.tabsContainer}>
        {tabs.map((tab: TabItem, index: number) => (
          <Tab key={index} label={tab.name} className={styles.orderTabs}>
            {tab.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderExpanded;
