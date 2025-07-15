import React from 'react';
import { ExtensionSlot, type PatientUuid } from '@openmrs/esm-framework';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import HistoryAndComments from '../history/history-and-comments.component';
import styles from './prescription-expanded.scss';
import PrescriptionDetails from './prescription-details.component';

interface TabItem {
  name: string;
  component: JSX.Element;
}

const PrescriptionExpanded: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
  status: string;
}> = ({ encounterUuid, patientUuid, status }) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t('prescriptionDetails', 'Prescription details'),
      component: <PrescriptionDetails encounterUuid={encounterUuid} patientUuid={patientUuid} />,
    },
    {
      name: t('conditionsAndDiagnoses', 'Conditions and diagnoses'),
      component: <ExtensionSlot name="dispensing-condition-and-diagnoses" state={{ patientUuid, encounterUuid }} />,
    },
    {
      name: t('historyComments', 'History and comments'),
      component: <HistoryAndComments encounterUuid={encounterUuid} patientUuid={patientUuid} />,
    },
  ];

  return (
    <div className={styles.expandedTabsParentContainer}>
      <div className={styles.expandedTabsContainer}>
        <Tabs>
          <TabList aria-label={t('tabList', 'Tab List')}>
            {tabs.map((tab: TabItem, index: number) => (
              <Tab key={index} className={styles.orderTabs}>
                {tab.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((tab: TabItem, index) => (
              <TabPanel key={index}>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default PrescriptionExpanded;
