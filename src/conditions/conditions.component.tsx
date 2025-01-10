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
import { usePatientConditions } from './conditions.resource';
import styles from './conditions.scss';
import { formatDate, parseDate } from '@openmrs/esm-framework';

type PatientConditionsProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientConditions: React.FC<PatientConditionsProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();
  const { conditions, error, isLoading, mutate } = usePatientConditions(patientUuid);
  const headers = useMemo(() => {
    return [
      { header: t('activeConditions', 'Active Conditions'), key: 'display' },
      { header: t('onsetDate', 'Onset Date'), key: 'onsetDateTime' },
    ];
  }, [t]);

  const tablerows = useMemo(() => {
    return (conditions ?? []).map((c) => ({ ...c, onsetDateTime: formatDate(parseDate(c.onsetDateTime)) }));
  }, [conditions]);

  if (isLoading)
    return (
      <InlineLoading
        iconDescription="Loading"
        description={t('loadingConditions', 'Loading Conditions ...')}
        status="active"
      />
    );

  if (error)
    return <InlineNotification kind="error" subtitle={t('conditionsError', 'Error loading conditions')} lowContrast />;

  return (
    <Layer className={styles.conditionsContainer}>
      <div className={styles.heading}>
        <h4>{t('conditions', 'Conditions')}</h4>
      </div>
      <DataTable useZebraStyles rows={tablerows} headers={headers}>
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
                      <p className={styles.emptyText}>{t('noConditions', 'No conditions for this patient')}</p>
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

export default PatientConditions;
