import React, { useEffect, useMemo, useState } from 'react';
import { Tab, Tabs, TabList, TabPanels } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { type CustomTab, type PrescriptionStage } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { MissingOptionalBackendDependencyError, useLocations } from '../location/location.resource';
import { usePrescriptionsByStage } from '../medication-request/medication-request.resource';
import StageTiles from '../dispensing-tiles/stage-tiles.component';
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
  // Lab-style stages, in the order of their tabs (after Search)
  const stages: Array<{ stage: PrescriptionStage; title: string }> = [
    { stage: 'ordered', title: t('ordered', 'Ordered') },
    { stage: 'picked', title: t('picked', 'Picked') },
    { stage: 'dispensed', title: t('dispensed', 'Dispensed') },
    { stage: 'declined', title: t('declined', 'Declined') },
  ];
  const firstStageTab = 1;
  const allPrescriptionsTab = firstStageTab + stages.length;
  const [selectedTab, setSelectedTab] = useState(firstStageTab);

  // the tiles count what the stage tabs show by default: the pharmacy linked to this session location
  const sessionPharmacyLocations = useMemo(
    () => locations?.filter((location) => location.associatedPharmacyLocation === session.sessionLocation?.uuid) ?? [],
    [locations, session],
  );
  const { counts, isLoading: isCountsLoading } = usePrescriptionsByStage(
    !isLocationsLoading,
    '',
    sessionPharmacyLocations,
    config.medicationRequestExpirationPeriodInDays,
    config.refreshInterval,
  );

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
        <StageTiles
          counts={counts}
          isLoading={isCountsLoading}
          selectedStage={stages[selectedTab - firstStageTab]?.stage}
          onSelect={(stage) => setSelectedTab(firstStageTab + stages.findIndex((s) => s.stage === stage))}
        />
        <Tabs selectedIndex={selectedTab} onChange={handleTabChange}>
          <TabList aria-label={t('tabList', 'Tab List')} contained className={styles.tabsContainer}>
            <Tab title={t('search', 'Search')} id={'tab-search'} className={styles.tab}>
              {t('search', 'Search')}
            </Tab>
            {stages.map(({ stage, title }) => (
              <Tab key={stage} title={title} id={'tab-' + stage} className={styles.tab}>
                {title} ({counts[stage]})
              </Tab>
            ))}
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
            <PatientSearchTabPanel locations={locations} />
            {stages.map(({ stage }, index) => (
              <PrescriptionTabPanel
                key={stage}
                isTabActive={selectedTab === firstStageTab + index}
                stage={stage}
                locations={locations}
                isLocationsLoading={isLocationsLoading}
              />
            ))}
            <PrescriptionTabPanel
              isTabActive={selectedTab === allPrescriptionsTab}
              status={''}
              locations={locations}
              isLocationsLoading={isLocationsLoading}
            />
            {customTabs.map((tab, index) => (
              <PrescriptionTabPanel
                isTabActive={selectedTab === allPrescriptionsTab + 1 + index}
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
