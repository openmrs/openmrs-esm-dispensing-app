import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect, Search, TabPanel } from '@carbon/react';
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
  const [locations, setLocations] = useState<SimpleLocation[]>([]);

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
            <MultiSelect
              hideLabel
              id="locationFilter"
              label={t('filterByLocations', 'Filter by locations')}
              items={isFilterLocationsLoading ? [] : filterLocations}
              itemToString={(item: SimpleLocation) => item?.name}
              onChange={({ selectedItems }) => {
                setLocations(selectedItems);
              }}
              className={styles.locationFilter}
            />
          )}
      </div>
      <PrescriptionsTable
        loadData={isTabActive}
        status={status}
        debouncedSearchTerm={debouncedSearchTerm}
        locations={locations}
      />
    </TabPanel>
  );
};

export default PrescriptionTabPanel;
