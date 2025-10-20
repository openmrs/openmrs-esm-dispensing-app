import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { AddIcon, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './fill-prescription-button.scss';

const FillPrescriptionButton: React.FC<{}> = () => {
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation();

  // See PatientSearchWorkspaceProps in patient-search-app
  const workspaceProps = {
    initialQuery: searchTerm,
    nonNavigationSelectPatientAction: (_: string, patient: fhir.Patient) => {
      launchWorkspace('fill-prescription-form', {
        patient,
      });
    },
    handleSearchTermUpdated: (value: string) => {
      setSearchTerm(value);
    },
  };

  const launchSearchWorkspace = () => {
    launchWorkspace('patient-search-workspace', workspaceProps);
  };

  return (
    <div className={styles.buttonContainer}>
      <Button
        kind="primary"
        renderIcon={(props) => <AddIcon size={16} {...props} />}
        size={responsiveSize}
        onClick={launchSearchWorkspace}>
        {t('fillPrescription', 'Fill prescription')}
      </Button>
    </div>
  );
};

export default FillPrescriptionButton;
