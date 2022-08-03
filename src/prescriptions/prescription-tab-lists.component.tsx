import React, { ReactNode, useState } from "react";
import {
  DataTable,
  DataTableSkeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "carbon-components-react";
import { useTranslation } from "react-i18next";
import styles from "./prescriptions.scss";
import { useOrders } from "../medication-request/medication-request.resource";
import OrderExpanded from "../components/order-expanded.component";

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

const columns = [
  { header: "Created", key: "created" },
  { header: "Patient name", key: "patientName" },
  { header: "Prescriber", key: "prescriber" },
  { header: "Drugs", key: "drugs" },
  { header: "Last dispenser", key: "lastDispenser" },
  { header: "Status", key: "status" },
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
            <DataTable rows={orders} headers={columns} isSortable>
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
              }) => (
                <TableContainer>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <OrderExpanded />
                            </TableExpandedRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )}
        </div>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
