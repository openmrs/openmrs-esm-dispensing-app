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
  Tag,
  Tile,
} from '@carbon/react';
import { ErrorState, usePagination, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import ActionButtons from '../components/action-buttons.component';
import MedicationEvent from '../components/medication-event.component';
import { type MedicationRequest, MedicationRequestCombinedStatus } from '../types';
import { computeMedicationRequestCombinedStatus } from '../utils';
import { PRIVILEGE_CREATE_DISPENSE } from '../constants';
import { usePrescriptionDetails } from '../medication-request/medication-request.resource';
import { usePatientDiagnosis } from './diagnoses.resource';
import styles from './diagnoses.scss';

type PatientDiagnosesProps = {
  patientUuid: string;
  encounterUuid: string;
};

const PatientDiagnoses: React.FC<PatientDiagnosesProps> = ({ encounterUuid, patientUuid }) => {
  const { t } = useTranslation();

  const { diagnoses, isLoading, error } = usePatientDiagnosis(encounterUuid);
  const [pageSize, setPageSize] = useState(3);
  const pageSizesOptions = useMemo(() => [3, 5, 10, 20, 50, 100], []);
  const { results, totalPages, currentPage, goTo } = usePagination(diagnoses, pageSize);

  const config = useConfig<any>();
  const {
    medicationRequestBundles,
    isLoading: isMedLoading,
    error: medError,
  } = usePrescriptionDetails(encounterUuid, config?.refreshInterval);

  const generateStatusTag: Function = (medicationRequest: MedicationRequest) => {
    const combinedStatus: MedicationRequestCombinedStatus = computeMedicationRequestCombinedStatus(
      medicationRequest,
      config.medicationRequestExpirationPeriodInDays,
    );
    if (combinedStatus === MedicationRequestCombinedStatus.cancelled) {
      return <Tag type="red">{t('cancelled', 'Cancelled')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.completed) {
      return <Tag type="green">{t('completed', 'Completed')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.expired) {
      return <Tag type="red">{t('expired', 'Expired')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.declined) {
      return <Tag type="red">{t('closed', 'Closed')}</Tag>;
    }

    if (combinedStatus === MedicationRequestCombinedStatus.on_hold) {
      return <Tag type="red">{t('paused', 'Paused')}</Tag>;
    }

    return null;
  };

  const diagnosisTitle = t('finalDiagnoses', 'Final Diagnoses');
  const diagnosisHeaders = useMemo(() => {
    return [
      { header: t('diagnosis', 'Diagnosis'), key: 'text' },
      { header: t('status', 'Status'), key: 'certainty' },
    ];
  }, [t]);

  return (
    <Layer>
      {isMedLoading && <DataTableSkeleton role="progressbar" />}
      {medError && <p>{t('error', 'Error')}</p>}
      {medicationRequestBundles?.map((bundle) => (
        <Tile key={bundle.request.id} className={styles.prescriptionTile}>
          <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
            <ActionButtons patientUuid={patientUuid} encounterUuid={encounterUuid} medicationRequestBundle={bundle} />
          </UserHasAccess>
          <MedicationEvent medicationEvent={bundle.request} status={generateStatusTag(bundle.request)} />
        </Tile>
      ))}

      <CardHeader title={diagnosisTitle}>
        <React.Fragment />
      </CardHeader>

      {isLoading ? (
        <DataTableSkeleton />
      ) : error ? (
        <ErrorState headerTitle={diagnosisTitle} error={error} />
      ) : !diagnoses?.length ? (
        <EmptyState headerTitle={diagnosisTitle} displayText={t('visitFinalDiagnoses')} />
      ) : (
        <>
          <DataTable useZebraStyles rows={results} headers={diagnosisHeaders}>
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
        </>
      )}
    </Layer>
  );
};

export default PatientDiagnoses;
