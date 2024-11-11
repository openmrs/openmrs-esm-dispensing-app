import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import dispensingComponent from './dispensing.component';
import dispensingLinkComponent from './dispensing-link.component';
import dispensingDashboardComponent from './dashboard/dispensing-dashboard.component';
import dispensingLinkHomepageComponent from './dashboard/dispensing-dashboard-link.component';
import { DispenseButton } from './components/action-buttons/dispense-button.component';
import { PauseButton } from './components/action-buttons/pause-button.component';
import { CloseButton } from './components/action-buttons/cancel-button.component';

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

// Dispensing action buttons
export const dispenseActionButton = getSyncLifecycle(DispenseButton, options);
export const pauseActionButton = getSyncLifecycle(PauseButton, options);
export const closeActionButton = getSyncLifecycle(CloseButton, options);
