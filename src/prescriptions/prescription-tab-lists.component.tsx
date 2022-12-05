import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanels, Search, Button } from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import PrescriptionTabPanel from "./prescription-tab-panel.component";
import styles from "./prescriptions.scss";

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const tabs = [
  { label: "activePrescriptions", status: "ACTIVE" },
  { label: "allPrescriptions", status: "" },
];

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className={`omrs-main-content ${styles.prescriptionListContainer}`}>
      <section className={styles.prescriptionTabsContainer}>
        <Tabs
          className={styles.prescriptionTabs}
          type="container"
          tabContentClassName={styles.hiddenTabsContent}
          onSelectionChange={setSelectedTab}
        >
          <TabList
            aria-label="Tab List"
            contained
            className={styles.tabsContainer}
          >
            {tabs.map((tab, index) => {
              return (
                <Tab
                  title={t(tab.label)}
                  key={index}
                  id={"tab-" + index}
                  className={styles.tab}
                >
                  {t(tab.label)}
                </Tab>
              );
            })}
          </TabList>
          <div className={styles.searchContainer}>
            <Button
              kind="primary"
              renderIcon={(props) => <Add size={24} />}
              className={styles.addPrescriptionBtn}
              size="sm"
            >
              {t("fillPrescription", "Fill prescription")}
            </Button>
            <Search
              closeButtonLabelText="Clear search input"
              defaultValue={searchTerm}
              placeholder={t("searchPrescription", "Search prescription")}
              labelText="Search prescriptions"
              onChange={(e) => {
                e.preventDefault();
                setSearchTerm(e.target.value);
              }}
              size="md"
              className={styles.patientSearch}
            />
          </div>
          <TabPanels>
            {tabs.map((tab, index) => {
              return (
                <PrescriptionTabPanel
                  searchTerm={searchTerm}
                  status={tab.status}
                />
              );
            })}
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
