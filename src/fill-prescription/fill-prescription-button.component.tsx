import React from 'react';
import { Button } from '@carbon/react';
import {
  AddIcon,
  launchWorkspace,
  launchWorkspace2,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './fill-prescription-button.scss';
import { getPrescriptionDetails } from '../medication-request/medication-request.resource';
import { initiateMedicationDispenseBody, useProviders } from '../medication-dispense/medication-dispense.resource';
import { computeQuantityRemaining } from '../utils';
import { type PharmacyConfig } from '../config-schema';

const FillPrescriptionButton: React.FC<{}> = () => {
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const { t } = useTranslation();
  const { dispenseBehavior, dispenserProviderRoles } = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(dispenserProviderRoles);

  const onAfterSaveFillPrescriptionForm = (patient: fhir.Patient, encounterUuid: string) => {
    const fillDispensingForm = (props) => {
      return new Promise((resolve) => {
        const onWorkspaceClosed = resolve;
        launchWorkspace2('dispense-workspace', { ...props, onWorkspaceClosed });
      });
    };

    getPrescriptionDetails(encounterUuid)
      .then(async (prescriptionDetails) => {
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
            medicationDispense: initiateMedicationDispenseBody(
              medicationRequestBundle.request,
              session,
              providers,
              true,
            ),
            medicationRequestBundle,
            quantityRemaining,
            quantityDispensed,
            mode: 'enter',
          };

          await fillDispensingForm(dispenseFormProps);
        }
      })
      .catch(() => {
        showSnackbar({
          isLowContrast: true,
          kind: 'error',
          title: t('errorLoadingPrescriptionDetails', 'Error loading prescription details'),
          subtitle: t('tryRefreshingThePage', 'Try refreshing the page.'),
        });
      });
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
