import React, { useEffect, useState } from "react";
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
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
  TabPanel,
} from "@carbon/react";

import { useTranslation } from "react-i18next";

import { formatDatetime, parseDate } from "@openmrs/esm-framework";
import PrescriptionExpanded from "../components/prescription-expanded.component";
import { usePrescriptionsTable } from "../medication-request/medication-request.resource";
import { PrescriptionsTableRow } from "../types";
import styles from "./prescriptions.scss";

const columns = [
  { header: "Created", key: "created" },
  { header: "Patient name", key: "patientName" },
  { header: "Prescriber", key: "prescriber" },
  { header: "Drugs", key: "drugs" },
  { header: "Last dispenser", key: "lastDispenser" },
  { header: "Status", key: "status" },
];

interface PrescriptionTabPanelProps {
  searchTerm: string;
  status: string;
}

const PrescriptionTabPanel: React.FC<PrescriptionTabPanelProps> = ({
  searchTerm,
  status,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nextOffSet, setNextOffSet] = useState(0);
  const { prescriptionsTableRows, mutate, isError, isLoading, totalOrders } =
    usePrescriptionsTable(pageSize, nextOffSet, searchTerm, status);
  const encounterToPatientMap = {};

  useEffect(() => {
    if (prescriptionsTableRows?.length > 0) {
      prescriptionsTableRows.map((order: PrescriptionsTableRow) => {
        encounterToPatientMap[order.id] = order.patientUuid;
      });
    }
  }, [prescriptionsTableRows]);

  // reset back to page 1 whenever search term changes
  useEffect(() => {
    setPage(1);
    setNextOffSet(0);
  }, [searchTerm]);

  return (
    <TabPanel>
      <div className={styles.patientListTableContainer}>
        {isLoading && <DataTableSkeleton role="progressbar" />}
        {isError && <p>Error</p>}
        {prescriptionsTableRows && (
          <>
            <DataTable
              rows={prescriptionsTableRows}
              headers={columns}
              isSortable
            >
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
              }) => (
                <TableContainer>
                  <Table {...getTableProps()} useZebraStyles>
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
                                {cell.id.endsWith("created")
                                  ? formatDatetime(parseDate(cell.value))
                                  : cell.id.endsWith("status")
                                  ? t(cell.value)
                                  : cell.value}
                              </TableCell>
                            ))}
                          </TableExpandRow>
                          <TableExpandedRow colSpan={headers.length + 1}>
                            <PrescriptionExpanded
                              encounterUuid={row.id}
                              patientUuid={encounterToPatientMap[row.id]}
                              mutate={mutate}
                            />
                          </TableExpandedRow>
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
  );
};

export default PrescriptionTabPanel;
