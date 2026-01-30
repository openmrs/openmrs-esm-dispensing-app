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
import { CardHeader, EmptyCard, ErrorState, usePagination } from '@openmrs/esm-framework';
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
  const title = t('diagnoses', 'Diagnoses');
  const headers = useMemo(
    () => [
      { header: t('diagnosis', 'Diagnosis'), key: 'text' },
      { header: t('status', 'Status'), key: 'certainty' },
    ],
    [t],
  );

  const getColumnClass = (key: string) => {
    switch (key) {
      case 'text':
        return styles.diagnosisColumn;
      case 'certainty':
        return styles.statusColumn;
      default:
        return '';
    }
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={title} error={error} />;
  }

  if (!diagnoses?.length) {
    return (
      <Layer className={styles.diagnosesContainer}>
        <EmptyCard headerTitle={title} displayText={t('diagnosesEmpty', 'diagnoses')} />
      </Layer>
    );
  }

  return (
    <Layer className={styles.diagnosesContainer}>
      <CardHeader title={title}>
        <React.Fragment />
      </CardHeader>
      <DataTable useZebraStyles rows={results} headers={headers}>
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
