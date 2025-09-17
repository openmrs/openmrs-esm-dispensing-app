import React, { useState } from 'react';
import { Button, Search, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AppointmentsPictogram } from '@openmrs/esm-framework';
import PrescriptionsTable from './prescriptions-table.component';
import styles from './patient-search-tab-panel.scss';

const PatientSearchTabPanel: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  return (
    <TabPanel>
      <div className={styles.searchTabPanel}>
        <form
          className={styles.searchBar}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedSearchTerm(searchTerm);
          }}>
          <Search
            closeButtonLabelText={t('clearSearchInput', 'Clear search input')}
            defaultValue={searchTerm}
            placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
            labelText={t('searchForPatient', 'Search for a patient by name or identifier number')}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onClear={() => setSubmittedSearchTerm('')}
            size="lg"
          />
          <Button kind="secondary" type="submit">
            {t('search', 'Search')}
          </Button>
        </form>
        {submittedSearchTerm ? (
          <PrescriptionsTable
            loadData={true}
            status={'ACTIVE'}
            debouncedSearchTerm={submittedSearchTerm}
            location={''}
          />
        ) : (
          <div className={styles.searchForPatientPlaceholder}>
            <div>
              <AppointmentsPictogram />
              <h5>{t('searchForPatientHeader', 'Search for a patient')}</h5>
              <div>{t('searchForPatient', 'Search for a patient by name or identifier number')}</div>
            </div>
          </div>
        )}
      </div>
    </TabPanel>
  );
};

export default PatientSearchTabPanel;
