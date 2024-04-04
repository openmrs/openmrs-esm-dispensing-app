import React, { useEffect, useState } from 'react';
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
} from '@carbon/react';
import { useTranslation } from 'react-i18next';

import { formatDatetime, parseDate, useConfig } from '@openmrs/esm-framework';
import PrescriptionExpanded from './prescription-expanded.component';
import { usePrescriptionsTable } from '../medication-request/medication-request.resource';
import { PharmacyConfig } from '../config-schema';
import styles from './prescriptions.scss';

interface PrescriptionTabPanelProps {
  searchTerm: string;
  location: string;
  status: string;
}

const PrescriptionTabPanel: React.FC<PrescriptionTabPanelProps> = ({ searchTerm, location, status }) => {
  const { t } = useTranslation();
  const config = useConfig() as PharmacyConfig;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nextOffSet, setNextOffSet] = useState(0);
  const { prescriptionsTableRows, error, isLoading, totalOrders } = usePrescriptionsTable(
    pageSize,
    nextOffSet,
    searchTerm,
    location,
    status,
    config.medicationRequestExpirationPeriodInDays,
    config.refreshInterval,
  );

  let columns = [
    { header: t('created', 'Created'), key: 'created' },
    { header: t('patientName', 'Patient name'), key: 'patient' },
    { header: t('prescriber', 'Prescriber'), key: 'prescriber' },
    { header: t('drugs', 'Drugs'), key: 'drugs' },
    { header: t('lastDispenser', 'Last dispenser'), key: 'lastDispenser' },
    { header: t('status', 'Status'), key: 'status' },
  ];

  // add the locations column, if enabled
  if (config.locationBehavior?.locationColumn?.enabled) {
    columns = [...columns.slice(0, 3), { header: t('location', 'Location'), key: 'location' }, ...columns.slice(3)];
  }

  // reset back to page 1 whenever search term changes
  useEffect(() => {
    setPage(1);
    setNextOffSet(0);
  }, [searchTerm]);

  return (
    <TabPanel>
      <div className={styles.patientListTableContainer}>
        {isLoading && <DataTableSkeleton role="progressbar" />}
        {error && <p>Error</p>}
        {prescriptionsTableRows && (
          <>
            <DataTable rows={prescriptionsTableRows} headers={columns} isSortable>
              {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
                <TableContainer>
                  <Table {...getTableProps()} useZebraStyles>
                    <TableHead>
                      <TableRow>
                        <TableExpandHeader />
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.id.endsWith('created')
                                  ? formatDatetime(parseDate(cell.value))
                                  : cell.id.endsWith('patient')
                                  ? cell.value.name
                                  : cell.id.endsWith('status')
                                  ? t(cell.value)
                                  : cell.value}
                              </TableCell>
                            ))}
                          </TableExpandRow>
                          <TableExpandedRow colSpan={headers.length + 1}>
                            <PrescriptionExpanded
                              encounterUuid={row.id}
                              patientUuid={row.cells.find((cell) => cell.id.endsWith('patient')).value.uuid}
                              status={row.cells.find((cell) => cell.id.endsWith('status')).value}
                            />
                          </TableExpandedRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <div style={{ width: '100%' }}>
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
