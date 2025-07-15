import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { usePatientDiagnosis } from './diagnoses.resource';
import styles from './diagnoses.scss';

type PatientDiagnosesProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientDiagnoses: React.FC<PatientDiagnosesProps> = ({ encounterUuid, patientUuid }) => {
  const { diagnoses, isLoading, error } = usePatientDiagnosis(encounterUuid);
  const [pageSize, setPageSize] = useState(3);
  const pageSizesOptions = useMemo(() => [3, 5, 10, 20, 50, 100], []);
  const { results, totalPages, currentPage, goTo } = usePagination(diagnoses, pageSize);
  const { t } = useTranslation();
  const title = t('finalDiagnoses', 'Final Diagnoses');
  const headers = useMemo(() => {
    return [
      { header: t('diagnosis', 'Diagnosis'), key: 'text' },
      { header: t('status', 'Status'), key: 'certainty' },
    ];
  }, [t]);
  if (isLoading) return <DataTableSkeleton />;

  if (error) return <ErrorState headerTitle={title} error={error} />;

  if (!diagnoses?.length)
    return (
      <Layer className={styles.diagnosesContainer}>
        <EmptyState headerTitle={title} displayText={t('visitFinalDiagnoses', 'Visit final diagnoses')} />
      </Layer>
    );

  return (
    <Layer className={styles.diagnosesContainer}>
      <CardHeader title={title}>
        <React.Fragment />
      </CardHeader>
      <DataTable useZebraStyles rows={results} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header, i) => (
                  <TableHeader {...getHeaderProps({ header })} key={i}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow {...getRowProps({ row })} key={i}>
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
        totalItems={diagnoses.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </Layer>
  );
};

export default PatientDiagnoses;
