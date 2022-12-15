import React from "react";
import { PatientUuid } from "@openmrs/esm-framework";
import { Tab, Tabs, TabList, TabPanels, TabPanel, Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import HistoryAndComments from "./history-and-comments.component";
import styles from "./prescription-expanded.scss";
import PrescriptionDetails from "./prescription-details.component";
import { TrashCan } from "@carbon/react/icons";
import InitializeDispenseFormFromRequests from "../forms/initialize-dispense-form-from-requests.component";
import { launchOverlay } from "../hooks/useOverlay";

interface TabItem {
  name: string;
  component: JSX.Element;
}

const PrescriptionExpanded: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
  mutate: Function;
}> = ({ encounterUuid, patientUuid, mutate }) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t("prescriptionDetails", "Prescription details"),
      component: (
        <PrescriptionDetails
          encounterUuid={encounterUuid}
          patientUuid={patientUuid}
        />
      ),
    },
    {
      name: t("historyComments", "History and comments"),
      component: (
        <HistoryAndComments encounterUuid={encounterUuid} mutate={mutate} />
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
          <TabList aria-label="Tab List">
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
      <div className={styles.prescriptionActions}>
        <Button
          kind="primary"
          className={styles.dispenseBtn}
          onClick={() =>
            launchOverlay(
              t("dispensePrescription", "Dispense prescription"),
              <InitializeDispenseFormFromRequests
                encounterUuid={encounterUuid}
                mutate={mutate}
              />
            )
          }
        >
          {t("dispense", "Dispense")}
        </Button>
        <Button kind="secondary" className={styles.returnToPrescriberBtn}>
          {t("sendBackToPrescriber", "Send back to prescriber")}
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionExpanded;
