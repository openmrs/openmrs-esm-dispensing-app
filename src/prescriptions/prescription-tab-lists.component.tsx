import React, { useEffect, useMemo, useState } from 'react';
import { Tab, Tabs, TabList, TabPanels } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { type CustomTab } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { MissingOptionalBackendDependencyError, useLocations } from '../location/location.resource';
import PatientSearchTabPanel from './patient-search-tab-panel.component';
import PrescriptionTabPanel from './prescription-tab-panel.component';
import styles from './prescriptions.scss';

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const session = useSession();
  const { locations, isLoading: isLocationsLoading, error: locationsError } = useLocations(config);

  useEffect(() => {
    if (locationsError instanceof MissingOptionalBackendDependencyError) {
      showSnackbar({
        kind: 'error',
        title: t('configurationError', 'Configuration error'),
        subtitle: t(
          'locationFilterMisconfigured',
          'The location filter is misconfigured. Check that the required backend module is installed.',
        ),
      });
    }
  }, [locationsError, t]);
  const [selectedTab, setSelectedTab] = useState(0);

  // filter tabs based on session location
  const customTabs: Array<CustomTab> = useMemo(() => {
    return (
      config?.customTabs?.filter(
        (tab) => !tab.associatedLocations || tab.associatedLocations.includes(session.sessionLocation?.uuid),
      ) || []
    );
  }, [session, config]);

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
            {customTabs.map((tab, index) => (
              <Tab title={t(tab.title)} id={'custom_tab_' + index} className={styles.tab}>
                {t(tab.title)}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <PatientSearchTabPanel />
            <PrescriptionTabPanel
              isTabActive={selectedTab === 1}
              status={'ACTIVE'}
              locations={locations}
              isLocationsLoading={isLocationsLoading}
            />
            <PrescriptionTabPanel
              isTabActive={selectedTab === 2}
              status={''}
              locations={locations}
              isLocationsLoading={isLocationsLoading}
            />
            {customTabs.map((tab, index) => (
              <PrescriptionTabPanel
                isTabActive={selectedTab === index + 3}
                customPrescriptionsTableEndpoint={tab.customPrescriptionsTableEndpoint}
                locations={locations}
                isLocationsLoading={isLocationsLoading}
              />
            ))}
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
