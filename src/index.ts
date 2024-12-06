import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import dispensingComponent from './dispensing.component';
import dispensingLinkComponent from './dispensing-link.component';
import dispensingDashboardComponent from './dashboard/dispensing-dashboard.component';
import dispensingLinkHomepageComponent from './dashboard/dispensing-dashboard-link.component';
import DispenseActionButton from './components/prescription-actions/dispense-action-button.component';
import PauseActionButton from './components/prescription-actions/pause-action-button.component';
import CloseActionButton from './components/prescription-actions/close-action-button.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-dispensing-app';

const options = {
  featureName: 'dispensing',
  moduleName,
};

export const dispensing = getSyncLifecycle(dispensingComponent, options);

export const dispensingLink = getSyncLifecycle(dispensingLinkComponent, options);

export const dispensingDashboard = getSyncLifecycle(dispensingDashboardComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const dispensingDashboardLink = getSyncLifecycle(dispensingLinkHomepageComponent, options);

// Prescription action buttons
export const dispenseActionButton = getSyncLifecycle(DispenseActionButton, options);
export const pauseActionButton = getSyncLifecycle(PauseActionButton, options);
export const closeActionButton = getSyncLifecycle(CloseActionButton, options);

// Dispensing workspace
export const dispenseWorkspace = getAsyncLifecycle(() => import('./forms/dispense-form.component'), options);
export const closeDispenseWorkspace = getAsyncLifecycle(() => import('./forms/close-dispense-form.component'), options);
export const pauseDispenseWorkspace = getAsyncLifecycle(() => import('./forms/pause-dispense-form.component'), options);
