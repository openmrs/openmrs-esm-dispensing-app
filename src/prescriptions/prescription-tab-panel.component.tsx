import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect, Search, TabPanel } from '@carbon/react';
import { useConfig, useDebounce, useSession } from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import PrescriptionsTable from './prescriptions-table.component';
import styles from './prescriptions.scss';
import { useLocationsForFiltering } from '../location/location.resource';
import { type SimpleLocation } from '../types';

interface PrescriptionTabPanelProps {
  status: string;
  isTabActive: boolean;
}

const PrescriptionTabPanel: React.FC<PrescriptionTabPanelProps> = ({ status, isTabActive }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const { sessionLocation } = useSession();
  const { filterLocations, isLoading: isFilterLocationsLoading } = useLocationsForFiltering(config);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [locations, setLocations] = useState<SimpleLocation[]>([]);

  // set any initially selected locations
  useEffect(() => {
    if (!isFilterLocationsLoading && sessionLocation?.uuid) {
      setLocations(filterLocations?.filter((l) => sessionLocation?.uuid === l.associatedPharmacyLocation) || []);
    }
    // eslint-disable-next-line
  }, [isFilterLocationsLoading, sessionLocation]);

  return (
    <TabPanel>
      <div className={styles.searchContainer}>
        {config.locationBehavior?.locationFilter?.enabled &&
          !isFilterLocationsLoading &&
          filterLocations?.length > 1 && (
            <MultiSelect
              hideLabel
              id="locationFilter"
              label={t('filterByLocations', 'Filter by locations')}
              initialSelectedItems={
                isFilterLocationsLoading || !sessionLocation?.uuid
                  ? []
                  : filterLocations.filter((l) => sessionLocation?.uuid === l.associatedPharmacyLocation)
              }
              items={isFilterLocationsLoading ? [] : filterLocations}
              itemToString={(item: SimpleLocation) => item?.name}
              onChange={({ selectedItems }) => {
                setLocations(selectedItems);
              }}
              className={styles.locationFilter}
            />
          )}
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
