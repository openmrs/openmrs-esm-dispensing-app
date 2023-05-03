import React from "react";
import { PatientUuid } from "@openmrs/esm-framework";
import { Tab, Tabs, TabList, TabPanels, TabPanel } from "@carbon/react";
import { useTranslation } from "react-i18next";
import HistoryAndComments from "../history/history-and-comments.component";
import styles from "./prescription-expanded.scss";
import PrescriptionDetails from "./prescription-details.component";

interface TabItem {
  name: string;
  component: JSX.Element;
}

const PrescriptionExpanded: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
  mutate: Function;
  status: string;
}> = ({ encounterUuid, patientUuid, mutate, status }) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t("prescriptionDetails", "Prescription details"),
      component: (
        <PrescriptionDetails
          encounterUuid={encounterUuid}
          patientUuid={patientUuid}
          mutate={mutate}
        />
      ),
    },
    {
      name: t("historyComments", "History and comments"),
      component: (
        <HistoryAndComments
          encounterUuid={encounterUuid}
          mutate={mutate}
          patientUuid={patientUuid}
        />
      ),
    },
    /* {
      name: t("patientDetails", "Patient details"),
      component: <PatientDetails patientUuid={patientUuid} />,
    },*/
    // {
    //   name: t("billing", "Billing"),
    //   component: <div>Billing</div>,
    // },
  ];

  return (
    <div className={styles.expandedTabsParentContainer}>
      <div className={styles.expandedTabsContainer}>
        <Tabs>
          <TabList aria-label={t("tabList", "Tab List")}>
            {tabs.map((tab: TabItem, index: number) => (
              <Tab key={index} className={styles.orderTabs}>
                {tab.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((tab: TabItem, index) => (
              <TabPanel key={index}>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default PrescriptionExpanded;
