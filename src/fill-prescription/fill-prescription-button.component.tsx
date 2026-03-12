import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  AddIcon,
  launchWorkspace2,
  openmrsFetch,
  restBaseUrl,
  showModal,
  showSnackbar,
  useLayoutType,
  type FetchResponse,
  type Order,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import styles from './fill-prescription-button.scss';

const FillPrescriptionButton: React.FC<{}> = () => {
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'md';
  const { t } = useTranslation();

  const launchSearchWorkspace = () => {
    launchWorkspace2(
      'dispensing-patient-search-workspace',
      {
        workspaceTitle: t('fillPrescriptionForPatient', 'Fill prescription for patient'),
        onPatientSelected(
          patientUuid: string,
          patient: fhir.Patient,
          launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'],
          closeWorkspace: Workspace2DefinitionProps['closeWorkspace'],
        ) {
          getActiveVisitsForPatient(patientUuid).then(async (response) => {
            const activeVisit = response.data.results?.[0];
            if (activeVisit) {
              await closeWorkspace();
              launchWorkspace2(
                'dispensing-order-basket-workspace',
                {},
                {
                  patientUuid: patientUuid,
                  patient: patient,
                  visitContext: activeVisit,
                  drugOrderWorkspaceName: 'dispensing-order-basket-add-drug-order-workspace',
                  onOrderBasketSubmitted: (encounterUuid: string, _: Array<Order>) => {
                    showModal('on-prescription-filled-modal', {
                      patient,
                      encounterUuid,
                    });
                  },
                },
              );
            } else {
              showSnackbar({
                title: t('visitRequired', 'Visit required'),
                subtitle: t(
                  'visitRequiredForPatientToFillPrescription',
                  'Visit required for patient to fill prescription',
                ),
                kind: 'error',
              });
            }
          });
        },
      },
      {
        startVisitWorkspaceName: 'dispensing-start-visit-workspace',
      },
    );
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

function getActiveVisitsForPatient(
  patientUuid: string,
  abortController?: AbortController,
  v?: string,
): Promise<FetchResponse<{ results: Array<Visit> }>> {
  const custom = v ?? `default`;

  return openmrsFetch(`${restBaseUrl}/visit?patient=${patientUuid}&v=${custom}&includeInactive=false`, {
    signal: abortController?.signal,
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
}

export default FillPrescriptionButton;
