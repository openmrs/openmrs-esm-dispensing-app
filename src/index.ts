import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const moduleName = "@openmrs/esm-dispensing-app";

const options = {
  featureName: "dispensing",
  moduleName,
};

export const dispensing = getAsyncLifecycle(
  () => import("./dispensing.component"),
  options
);

export const dispensingLink = getAsyncLifecycle(
  () => import("./dispensing-link"),
  options
);

export const dispensingDashboard = getAsyncLifecycle(
  () => import("./dashboard/dispensing-dashboard.component"),
  options
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
