import React, { ReactNode, useCallback, useMemo, useState } from "react";
import Add16 from "@carbon/icons-react/es/add/16";
import {
  DataTableSkeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "carbon-components-react";
import { useTranslation } from "react-i18next";
import styles from "./prescriptions.scss";
import {
  Order,
  useOrders,
} from "../medication-request/medication-request.resource";

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = [
  "All prescriptions",
  "Active prescriptions",
  "Complete",
  "Returned",
  "Cancelled",
];

function createLabels() {
  const res: Array<ReactNode> = [];

  for (let index = 0; index < Object.keys(labelMap).length; index++) {
    res.push(<Tab label={labelMap[index]} key={index} id={"tab-" + index} />);
  }

  return res;
}

const columns: Array<[string, keyof Order]> = [
  ["Created", "created"],
  ["Patient name", "patientName"],
  ["Prescriber", "prescriber"],
  ["Drugs", "drugs"],
  ["Last dispenser", "lastDispenser"],
  ["Status", "status"],
];

const PrescriptionTabLists: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const { orders, isError, isLoading } = useOrders();

  return (
    <main className={`omrs-main-content ${styles.prescriptionListContainer}`}>
      <section className={styles.prescriptionTabsContainer}>
        <Tabs
          className={styles.tabs}
          type="container"
          tabContentClassName={styles.hiddenTabsContent}
          onSelectionChange={setSelectedTab}
        >
          {createLabels()}
        </Tabs>
        <div className={styles.patientListTableContainer}>
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
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
