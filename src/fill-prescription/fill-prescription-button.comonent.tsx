import React from 'react';
import { Button } from '@carbon/react';
import {
  AddIcon,
  launchWorkspace,
  launchWorkspace2,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './fill-prescription-button.scss';
import { type PharmacyConfig } from '../config-schema';
import { getPrescriptionDetails } from '../medication-request/medication-request.resource';
import { computeQuantityRemaining } from '../utils';
import { initiateMedicationDispenseBody, useProviders } from '../medication-dispense/medication-dispense.resource';

const FillPrescriptionButton: React.FC<{}> = () => {
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const { t } = useTranslation();
  const { dispenseBehavior, dispenserProviderRoles } = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(dispenserProviderRoles);
  const onAfterSaveFillPrescriptionForm = async (patient: fhir.Patient, encounterUuid: string) => {
    const fillDispensingForm = (props) => {
      return new Promise((resolve) => {
        const onWorkspaceClosed = resolve;
        launchWorkspace2('dispense-workspace', { ...props, onWorkspaceClosed });
      });
    };

    const prescriptionDetails = await getPrescriptionDetails(encounterUuid);
    const { medicationRequestBundles } = prescriptionDetails;
    for (const medicationRequestBundle of medicationRequestBundles) {
      let quantityRemaining = null;
      if (dispenseBehavior.restrictTotalQuantityDispensed) {
        quantityRemaining = computeQuantityRemaining(medicationRequestBundle);
      }

      const quantityDispensed = 0;
      const dispenseFormProps = {
        patientUuid: patient.id,
        encounterUuid,
        medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, true),
        medicationRequestBundle,
        quantityRemaining,
        quantityDispensed,
        mode: 'enter',
      };

      await fillDispensingForm(dispenseFormProps);
    }
  };
  // See PatientSearchWorkspaceProps in patient-search-app
  const workspaceProps = {
    initialQuery: '',
    nonNavigationSelectPatientAction: (_: string, patient: fhir.Patient) => {
      launchWorkspace('fill-prescription-form', {
        patient,
        onAfterSave: onAfterSaveFillPrescriptionForm,
      });
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
