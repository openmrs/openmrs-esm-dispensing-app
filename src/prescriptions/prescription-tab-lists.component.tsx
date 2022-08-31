import React, { ReactNode, useEffect, useState } from "react";
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
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
  TabList,
  TabPanels,
  TabPanel,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import styles from "./prescriptions.scss";
import {
  Order,
  useOrders,
} from "../medication-request/medication-request.resource";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nextOffSet, setNextOffSet] = useState(0);
  const { orders, isError, isLoading, totalOrders } = useOrders(
    pageSize,
    nextOffSet
  );
  const encounterToPatientMap = {};

  useEffect(() => {
    if (orders?.length > 0) {
      orders.map((order: Order) => {
        encounterToPatientMap[order.id] = order.patientUuid;
      });
    }
  }, [orders]);

  return (
    <main className={`omrs-main-content ${styles.prescriptionListContainer}`}>
      <section className={styles.prescriptionTabsContainer}>
        <Tabs
          className={styles.prescriptionTabs}
          type="container"
          tabContentClassName={styles.hiddenTabsContent}
          onSelectionChange={setSelectedTab}
        >
          <TabList contained className={styles.tabsContainer}>
            {labelMap.map((label, index) => {
              return (
                <Tab
                  title={label}
                  key={index}
                  id={"tab-" + index}
                  className={styles.tab}
                >
                  {label}
                </Tab>
              );
            })}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className={styles.patientListTableContainer}>
                {isLoading && <DataTableSkeleton role="progressbar" />}
                {isError && <p>Error</p>}
                {orders && (
                  <>
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
                                      <TableCell key={cell.id}>
                                        {cell.value}
                                      </TableCell>
                                    ))}
                                  </TableExpandRow>
                                  {row.isExpanded && (
                                    <TableExpandedRow
                                      colSpan={headers.length + 1}
                                    >
                                      <OrderExpanded
                                        encounterUuid={row.id}
                                        patientUuid={
                                          encounterToPatientMap[row.id]
                                        }
                                      />
                                    </TableExpandedRow>
                                  )}
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DataTable>
                    <div style={{ width: "100%" }}>
                      <Pagination
                        page={page}
                        pageSize={pageSize}
                        pageSizes={[10, 20, 30, 40, 50, 100]}
                        totalItems={totalOrders}
                        onChange={({ page, pageSize }) => {
                          setPage(page);
                          setNextOffSet((page - 1) * pageSize);
                          setPageSize(pageSize);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </section>
    </main>
  );
};

export default PrescriptionTabLists;
