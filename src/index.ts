import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const backendDependencies = {
  fhir2: "^1.2.0",
  "webservices.rest": "^2.2.0",
};

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-dispensing-app";

  const options = {
    featureName: "dispensing",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [
      {
        route: "dispensing",
        load: getAsyncLifecycle(
          () => import("./dispensing.component"),
          options
        ),
        online: true,
        offline: true,
      },
    ],
    extensions: [
      {
        id: "dispensing-link",
        slot: "app-menu-slot",
        load: getAsyncLifecycle(() => import("./dispensing-link"), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
