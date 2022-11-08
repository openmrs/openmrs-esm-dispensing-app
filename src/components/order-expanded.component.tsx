import React from "react";
import { PatientUuid } from "@openmrs/esm-framework";
import { Tab, Tabs, TabList, TabPanels, TabPanel, Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import HistoryAndComments from "./history-and-comments.component";
import styles from "./order-expanded.scss";
import PatientDetails from "./patient-details.component";
import PrescriptionDetails from "./prescription-details.component";
import { TrashCan } from "@carbon/react/icons";
import DispenseForm from "../forms/dispense-form.component";
import { launchOverlay } from "../hooks/useOverlay";

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
      component: (
        <PrescriptionDetails
          encounterUuid={encounterUuid}
          patientUuid={patientUuid}
        />
      ),
    },
    {
      name: t("historyComments", "History and comments"),
      component: <HistoryAndComments encounterUuid={encounterUuid} />,
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
          <TabList>
            {tabs.map((tab: TabItem, index: number) => (
              <Tab key={index} className={styles.orderTabs}>
                {tab.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((tab: TabItem) => (
              <TabPanel>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
      <div className={styles.prescriptionActions}>
        <Button
          kind="ghost"
          renderIcon={() => <TrashCan />}
          className={styles.deletePrescriptionBtn}
        >
          {t("deletePrescription", "Delete prescription")}
        </Button>
        <Button
          kind="primary"
          className={styles.dispenseBtn}
          onClick={() =>
            launchOverlay(
              t("dispensePrescription", "Dispense prescription"),
              <DispenseForm
                patientUuid={patientUuid}
                encounterUuid={encounterUuid}
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

export default OrderExpanded;
