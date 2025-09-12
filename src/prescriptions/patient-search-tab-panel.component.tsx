import React, { useState } from 'react';
import { Search, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AppointmentsPictogram, useDebounce } from '@openmrs/esm-framework';
import PrescriptionsTable from './prescriptions-table.component';
import styles from './patient-search-tab-panel.scss';

const PatientSearchTabPanel: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  return (
    <TabPanel>
      <div className={styles.searchTabPanel}>
        <div>
          <Search
            closeButtonLabelText={t('clearSearchInput', 'Clear search input')}
            defaultValue={searchTerm}
            placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
            labelText={t('searchForPatient', 'Search for a patient by name or identifier number')}
            onChange={(e) => {
              e.preventDefault();
              setSearchTerm(e.target.value);
            }}
            size="md"
            className={styles.searchBar}
          />
        </div>
        {debouncedSearchTerm ? (
          <PrescriptionsTable
            loadData={true}
            status={'ACTIVE'}
            debouncedSearchTerm={debouncedSearchTerm}
            location={''}
          />
        ) : (
          <div className={styles.searchForPatientPlaceholder}>
            <div>
              <AppointmentsPictogram />
              <h5>Search for a patient</h5>
              <div>Search for a patient by name or identifier number</div>
            </div>
          </div>
        )}
      </div>
    </TabPanel>
  );
};

export default PatientSearchTabPanel;
