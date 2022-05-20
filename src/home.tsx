/**
 * From here, the application is pretty typical React, but with lots of
 * support from `@openmrs/esm-framework`. Check out `Greeter` to see
 * usage of the configuration system, and check out `PatientGetter` to
 * see data fetching using the OpenMRS FHIR API.
 *
 * Check out the Config docs:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config
 */

import {
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react";

import React from "react";
import { Trans } from "react-i18next";
import styles from "./home.css";
import { useOrders } from "./medicationrequest/medicationrequest.resource";

const headers = [
  "Created",
  "Patient name",
  "Prescriber",
  "Drugs",
  "Last dispenser",
  "Status",
];

const Home: React.FC = () => {
  const { orders, isError, isLoading } = useOrders();

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (isError) {
    // render error state
    return <p>'Error'</p>;
  }
  if (orders) {
    //debugger
    return (
      <div className={`omrs-main-content ${styles.container}`}>
        <Trans key="dispensing">Medication Dispensing</Trans>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader id={header} key={header}>
                  {header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((row) => (
              <TableRow key={row.id}>
                {Object.keys(row)
                  .filter((key) => key !== "id")
                  .map((key) => {
                    return <TableCell key={key}>{row[key]}</TableCell>;
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default Home;
