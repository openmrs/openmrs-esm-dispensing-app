import {
  DataTable,
  InlineLoading,
  InlineNotification,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from '../components/empty-illustration';
import { usePatientDiagnosis } from './diagnoses.resource';
import styles from './diagnoses.scss';

type PatientDiagnosesProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientDiagnoses: React.FC<PatientDiagnosesProps> = ({ encounterUuid, patientUuid }) => {
  const { diagnoses, isLoading, error } = usePatientDiagnosis(encounterUuid);
  const { t } = useTranslation();
  const headers = useMemo(() => {
    return [
      { header: t('diagnosis', 'Diagnosis'), key: 'text' },
      { header: t('status', 'Status'), key: 'certainty' },
    ];
  }, [t]);

  if (isLoading)
    return (
      <InlineLoading
        iconDescription="Loading"
        description={t('loadingDiagnoses', 'Loading Diagnoses ...')}
        status="active"
      />
    );

  if (error)
    return <InlineNotification kind="error" subtitle={t('diagnosesError', 'Error loading diagnoses')} lowContrast />;

  return (
    <Layer className={styles.diagnosesContainer}>
      <div className={styles.heading}>
        <h4>{t('diagnoses', 'Diagnoses')}</h4>
      </div>
      <DataTable useZebraStyles rows={diagnoses} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={headers.length}>
                    <div className={styles.emptyState}>
                      <EmptyDataIllustration />
                      <p className={styles.emptyText}>{t('noDiagnoses', "No Diagnoses for this patient's visit")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </Layer>
  );
};

export default PatientDiagnoses;
