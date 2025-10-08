import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanels } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import PrescriptionTabPanel from './prescription-tab-panel.component';
import styles from './prescriptions.scss';
import PatientSearchTabPanel from './patient-search-tab-panel.component';

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event) => {
    setSelectedTab(event.selectedIndex);
  };

  return (
    <main className="omrs-main-content">
      <section className={styles.prescriptionTabsContainer}>
        <Tabs onChange={handleTabChange}>
          <TabList aria-label={t('tabList', 'Tab List')} contained className={styles.tabsContainer}>
            <Tab title={t('search', 'Search')} id={'tab-search'} className={styles.tab}>
              {t('search', 'Search')}
            </Tab>
            <Tab
              title={t('activePrescriptions', 'Active Prescriptions')}
              id={'tab-active-prescription'}
              className={styles.tab}>
              {t('activePrescriptions', 'Active Prescriptions')}
            </Tab>
            <Tab title={t('allPrescriptions', 'All Prescriptions')} id={'tab-all-prescription'} className={styles.tab}>
              {t('allPrescriptions', 'All Prescriptions')}
            </Tab>
          </TabList>
          <TabPanels>
            <PatientSearchTabPanel />
            <PrescriptionTabPanel isTabActive={selectedTab === 1} status={'ACTIVE'} />
            <PrescriptionTabPanel isTabActive={selectedTab === 2} status={''} />
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
