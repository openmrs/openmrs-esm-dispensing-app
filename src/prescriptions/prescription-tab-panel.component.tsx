import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, Search, TabPanel } from '@carbon/react';
import { useConfig, useDebounce } from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import PrescriptionsTable from './prescriptions-table.component';
import styles from './prescriptions.scss';
import { useLocationForFiltering } from '../location/location.resource';
import { type SimpleLocation } from '../types';

interface PrescriptionTabPanelProps {
  status: string;
  isTabActive: boolean;
}

const PrescriptionTabPanel: React.FC<PrescriptionTabPanelProps> = ({ status, isTabActive }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const { filterLocations, isLoading: isFilterLocationsLoading } = useLocationForFiltering(config);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [location, setLocation] = useState('');

  return (
    <TabPanel>
      <div className={styles.searchContainer}>
        <Search
          closeButtonLabelText={t('clearSearchInput', 'Clear search input')}
          defaultValue={searchTerm}
          placeholder={t('searchByPatientIdOrName', 'Search by patient ID or name')}
          labelText={t('searchByPatientIdOrName', 'Search by patient ID or name')}
          onChange={(e) => {
            e.preventDefault();
            setSearchTerm(e.target.value);
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
      <PrescriptionsTable
        loadData={isTabActive}
        status={status}
        debouncedSearchTerm={debouncedSearchTerm}
        location={location}
      />
    </TabPanel>
  );
};

export default PrescriptionTabPanel;
