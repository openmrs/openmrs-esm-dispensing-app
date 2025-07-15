import React, { useEffect, useState } from 'react';
import { ComboBox, Search, Tab, Tabs, TabList, TabPanels } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { useLocationForFiltering } from '../location/location.resource';
import { type SimpleLocation } from '../types';
import { type PharmacyConfig } from '../config-schema';
import PrescriptionTabPanel from './prescription-tab-panel.component';
import styles from './prescriptions.scss';

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const { filterLocations, isLoading: isFilterLocationsLoading } = useLocationForFiltering(config);
  const [searchTermUserInput, setSearchTermUserInput] = useState(''); // we have a separate "searchTermUserInput" and "searchTerm" in order to debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      key: 'activePrescriptions',
      header: t('activePrescriptions', 'Active Prescriptions'),
      status: 'ACTIVE',
    },
    {
      key: 'allPrescriptions',
      header: t('allPrescriptions', 'All Prescriptions'),
      status: '',
    },
  ];

  // debounce: delay the search term update so that a search isn't triggered on every single keystroke
  useEffect(() => {
    const debounceFn = setTimeout(() => {
      setSearchTerm(searchTermUserInput);
    }, 500);

    return () => clearTimeout(debounceFn);
  }, [searchTermUserInput]);

  // we use this to only render the tab panel that is currently selected, see O3-2777
  const handleTabChange = (event) => {
    setSelectedTab(event.selectedIndex);
  };

  return (
    <main className="omrs-main-content">
      <section className={styles.prescriptionTabsContainer}>
        <Tabs onChange={handleTabChange}>
          <TabList aria-label={t('tabList', 'Tab List')} contained className={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              return (
                <Tab title={t(tab.key)} key={index} id={'tab-' + index} className={styles.tab}>
                  {t(tab.header)}
                </Tab>
              );
            })}
          </TabList>
          <div className={styles.searchContainer}>
            {/* <Button
                kind="primary"
                renderIcon={(props) => <Add size={24} />}
                className={styles.addPrescriptionBtn}
                size="sm"
              >
                {t("fillPrescription", "Fill prescription")}
              </Button>*/}
            <Search
              closeButtonLabelText={t('clearSearchInput', 'Clear search input')}
              defaultValue={searchTermUserInput}
              placeholder={t('searchByPatientIdOrName', 'Search by patient ID or name')}
              labelText={t('searchByPatientIdOrName', 'Search by patient ID or name')}
              onChange={(e) => {
                e.preventDefault();
                setSearchTermUserInput(e.target.value);
              }}
              size="md"
              className={styles.patientSearch}
            />
            {config.locationBehavior?.locationFilter?.enabled &&
              !isFilterLocationsLoading &&
              filterLocations?.length > 1 && (
                <ComboBox
                  id="locationFilter"
                  placeholder={t('filterByLocation', 'Filter by location')}
                  items={isFilterLocationsLoading ? [] : filterLocations}
                  itemToString={(item: SimpleLocation) => item?.name}
                  onChange={({ selectedItem }) => {
                    setLocation(selectedItem?.id);
                  }}
                  className={styles.locationFilter}
                />
              )}
          </div>
          <TabPanels>
            {tabs.map((tab, index) => {
              return index === selectedTab ? (
                <PrescriptionTabPanel location={location} searchTerm={searchTerm} status={tab.status} />
              ) : (
                <></>
              );
            })}
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
