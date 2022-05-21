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
import styles from "./dispensing.scss";
import {
  Order,
  useOrders,
} from "./medicationrequest/medicationrequest.resource";

const columns: Array<[string, keyof Order]> = [
  ["Created", "created"],
  ["Patient name", "patientName"],
  ["Prescriber", "prescriber"],
  ["Drugs", "drugs"],
  ["Last dispenser", "lastDispenser"],
  ["Status", "status"],
];

export default function Dispensing() {
  const { orders, isError, isLoading } = useOrders();

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (isError) {
    // render error state
    return <p>Error</p>;
  }
  if (orders) {
    return (
      <div className={`omrs-main-content ${styles.container}`}>
        <Trans key="dispensing">Medication Dispensing</Trans>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(([header, _]) => (
                <TableHeader id={header} key={header}>
                  {header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                {columns.map(([_, key]) => {
                  return (
                    <TableCell key={`${order.id}-${key}`}>
                      {order[key]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
