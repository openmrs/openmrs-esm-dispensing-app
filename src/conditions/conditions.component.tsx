import React, { useMemo, useState } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { CardHeader, EmptyCard, ErrorState, usePagination } from '@openmrs/esm-framework';
import { pageSizesOptions, usePatientConditions } from './conditions.resource';
import styles from './conditions.scss';

type PatientConditionsProps = {
  patientUuid: string;
};

const PatientConditions: React.FC<PatientConditionsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { conditions, error, isLoading } = usePatientConditions(patientUuid);
  const [pageSize, setPageSize] = useState(3);
  const { results, currentPage, goTo } = usePagination(conditions, pageSize);
  const headers = useMemo(
    () => [
      { header: t('conditions', 'Condition'), key: 'display' },
      { header: t('onsetDate', 'Onset date'), key: 'onsetDateTime' },
    ],
    [t],
  );

  const getColumnClass = (key: string) => {
    switch (key) {
      case 'display':
        return styles.conditionColumn;
      case 'onsetDateTime':
        return styles.onsetDateColumn;
      default:
        return '';
    }
  };

  const title = t('activeConditions', 'Active conditions');
  const tableRows = useMemo(
    () =>
      results.map((row) => ({
        ...row,
        onsetDateTime: row.onsetDateTime || '--',
      })),
    [results],
  );

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={title} error={error} />;
  }

  if (!conditions?.length) {
    return (
      <Layer className={styles.conditionContainer}>
        <EmptyCard headerTitle={title} displayText={t('activeConditionsEmpty', 'active conditions')} />
      </Layer>
    );
  }

  return (
    <Layer className={styles.conditionContainer}>
      <CardHeader title={title}>
        <React.Fragment />
      </CardHeader>
      <DataTable useZebraStyles rows={tableRows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()} className={styles.table}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key} className={getColumnClass(header.key)}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id} className={getColumnClass(cell.info.header)}>
                      {cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizesOptions}
        totalItems={conditions.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </Layer>
  );
};

export default PatientConditions;
