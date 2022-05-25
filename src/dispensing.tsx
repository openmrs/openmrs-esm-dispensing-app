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
import styles from "./dispensing.scss";
import { PharmacyHeader } from "./pharmacy-header/pharmacy-header.component";
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

  return (
    <div className={`omrs-main-content ${styles.container}`}>
      <PharmacyHeader />
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>Error</p>}
      {orders && (
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
      )}
    </div>
  );
}
