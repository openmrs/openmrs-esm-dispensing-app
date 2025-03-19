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
import { ErrorState, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pageSizesOptions, usePatientConditions } from './conditions.resource';
import styles from './conditions.scss';

type PatientConditionsProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientConditions: React.FC<PatientConditionsProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const { conditions, error, isLoading, mutate } = usePatientConditions(patientUuid);
  const [pageSize, setPageSize] = useState(3);
  const { results, totalPages, currentPage, goTo } = usePagination(conditions, pageSize);
  const headers = useMemo(() => {
    return [
      { header: t('conditions', 'Condition'), key: 'display' },
      { header: t('onsetDate', 'Onset Date'), key: 'onsetDateTime' },
    ];
  }, [t]);

  const title = t('activecondition', 'Active Condition');

  if (isLoading) return <DataTableSkeleton />;

  if (error) return <ErrorState headerTitle={title} error={error} />;

  if (!conditions?.length)
    return (
      <Layer className={styles.conditionContainer}>
        <EmptyState headerTitle={title} displayText={t('activeConditions', 'Active Condition')} />
      </Layer>
    );

  return (
    <Layer className={styles.conditionContainer}>
      <CardHeader title={title}>
        <React.Fragment />
      </CardHeader>
      <DataTable useZebraStyles rows={results} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader {...getHeaderProps({ header })} key={index}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow {...getRowProps({ row })} key={index}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
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
