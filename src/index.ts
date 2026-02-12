import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CloseActionButton from './components/prescription-actions/close-action-button.component';
import DispenseActionButton from './components/prescription-actions/dispense-action-button.component';
import DispensingComponent from './dispensing.component';
import DispensingDashboardComponent from './dashboard/dispensing-dashboard.component';
import DispensingLinkComponent from './dispensing-link.component';
import DispensingLinkHomepageComponent from './dashboard/dispensing-dashboard-link.component';
import PauseActionButton from './components/prescription-actions/pause-action-button.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-dispensing-app';

const options = {
  featureName: 'dispensing',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const dispensing = getSyncLifecycle(DispensingComponent, options);

export const dispensingLink = getSyncLifecycle(DispensingLinkComponent, options);

export const dispensingDashboard = getSyncLifecycle(DispensingDashboardComponent, options);

export const dispensingDashboardLink = getSyncLifecycle(DispensingLinkHomepageComponent, options);

// Prescription action buttons
export const closeActionButton = getSyncLifecycle(CloseActionButton, options);
export const dispenseActionButton = getSyncLifecycle(DispenseActionButton, options);
export const pauseActionButton = getSyncLifecycle(PauseActionButton, options);

// Dispensing workspace
// t('closePrescription', 'Close prescription')
export const closeDispenseWorkspace = getAsyncLifecycle(() => import('./forms/close-dispense-form.workspace'), options);
// t('dispensePrescription', 'Dispense prescription')
export const dispenseWorkspace = getAsyncLifecycle(() => import('./forms/dispense-form.workspace'), options);
// t('pausePrescription', 'Pause prescription')
export const pauseDispenseWorkspace = getAsyncLifecycle(() => import('./forms/pause-dispense-form.workspace'), options);

export const printPrescriptionPreviewModal = getSyncLifecycle(PrescriptionPrintPreviewModal, options);
export const deleteConfirmModal = getAsyncLifecycle(() => import('./history/delete-confrim.modal'), options);
export const duplicatePrescriptionModal = getAsyncLifecycle(
  () => import('./forms/duplicate-prescription.modal'),
  options,
);
export const printPrescriptionPreviewModal = getAsyncLifecycle(
  () => import('./print-prescription/prescription-print-preview.modal'),
  options,
);
export const deleteConfirmModal = getAsyncLifecycle(() => import('./history/delete-confirm.modal'), options);

export const patientDiagnoses = getAsyncLifecycle(() => import('./diagnoses/diagnoses.component'), options);
export const patientConditions = getAsyncLifecycle(() => import('./conditions/conditions.component'), options);

export const onPrescriptionFilledModal = getAsyncLifecycle(
  () => import('./fill-prescription/on-prescription-filled.modal'),
  options,
);
