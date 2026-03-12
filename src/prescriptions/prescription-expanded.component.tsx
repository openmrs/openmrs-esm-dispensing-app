import React from 'react';
import { getAssignedExtensions, ExtensionSlot, type PatientUuid } from '@openmrs/esm-framework';
import { Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import HistoryAndComments from '../history/history-and-comments.component';
import PrescriptionDetails from './prescription-details.component';
import styles from './prescription-expanded.scss';

interface TabItem {
  name: string;
  component: JSX.Element;
}

const PrescriptionExpanded: React.FC<{
  encounterUuid: string;
  patientUuid: PatientUuid;
}> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const conditionsAndDiagnosisExtensions = getAssignedExtensions('dispensing-condition-and-diagnoses');

  const tabs: TabItem[] = [
    {
      name: t('prescriptionDetails', 'Prescription details'),
      component: <PrescriptionDetails encounterUuid={encounterUuid} patientUuid={patientUuid} />,
    },
    conditionsAndDiagnosisExtensions && conditionsAndDiagnosisExtensions.length > 0
      ? {
          name: t('conditionsAndDiagnoses', 'Conditions and diagnoses'),
          component: <ExtensionSlot name="dispensing-condition-and-diagnoses" state={{ patientUuid, encounterUuid }} />,
        }
      : null,
    {
      name: t('historyComments', 'History and comments'),
      component: <HistoryAndComments encounterUuid={encounterUuid} patientUuid={patientUuid} />,
    },
  ];

  return (
    <div className={styles.expandedTabsParentContainer}>
      <div className={styles.verticalTabs}>
        <Tabs>
          <TabList aria-label={t('tabList', 'Tab List')}>
            {tabs.filter(Boolean).map((tab: TabItem, index: number) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.filter(Boolean).map((tab: TabItem, index) => (
              <TabPanel key={index}>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default PrescriptionExpanded;
