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

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    {
      key: "activePrescriptions",
      header: t("activePrescriptions", "Active Prescriptions"),
      status: "ACTIVE",
    },
    {
      key: "allPrescriptions",
      header: t("allPrescriptions", "All Prescriptions"),
      status: "",
    },
  ];

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
            aria-label={t("tabList", "Tab List")}
            contained
            className={styles.tabsContainer}
          >
            {tabs.map((tab, index) => {
              return (
                <Tab
                  title={t(tab.key)}
                  key={index}
                  id={"tab-" + index}
                  className={styles.tab}
                >
                  {t(tab.header)}
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
              closeButtonLabelText={t("clearSearchInput", "Clear search input")}
              defaultValue={searchTerm}
              placeholder={t("searchPrescriptions", "Search prescriptions")}
              labelText={t("searchPrescriptions", "Search prescriptions")}
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
