import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import { useTranslation } from "react-i18next";
import HistoryAndComments from "./history-and-comments.component";
import styles from "./order-expanded.scss";
import PrescriptionDetails from "./prescription-details.component";

interface TabItem {
  name: string;
  component: JSX.Element;
}

const OrderExpanded: React.FC = () => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t("prescriptionDetails", "Prescription details"),
      component: <PrescriptionDetails />,
    },
    {
      name: t("historyComments", "History and comments"),
      component: <HistoryAndComments />,
    },
    {
      name: t("patientDetails", "Patient details"),
      component: <div>Patient details</div>,
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
