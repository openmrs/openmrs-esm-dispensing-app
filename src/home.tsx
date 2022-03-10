/**
 * From here, the application is pretty typical React, but with lots of
 * support from `@openmrs/esm-framework`. Check out `Greeter` to see
 * usage of the configuration system, and check out `PatientGetter` to
 * see data fetching using the OpenMRS FHIR API.
 *
 * Check out the Config docs:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config
 */

import React from "react";
import { Trans } from "react-i18next";
import styles from "./home.css";

const Home: React.FC = () => {
  return (
    <div className={`omrs-main-content ${styles.container}`}>
      <Trans key="dispensing">Medication Dispensing</Trans>
    </div>
  );
};

export default Home;
