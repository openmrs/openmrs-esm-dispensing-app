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
  Tile,
  Tag,
} from '@carbon/react';
import { ErrorState, usePagination, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { usePatientDiagnosis } from './diagnoses.resource';
import { usePrescriptionDetails } from '../medication-request/medication-request.resource';
import ActionButtons from '../components/action-buttons.component';
import MedicationEvent from '../components/medication-event.component';
import { PRIVILEGE_CREATE_DISPENSE } from '../constants';
import { computeMedicationRequestCombinedStatus } from '../utils';
import { MedicationRequestCombinedStatus } from '../types';
import type { PharmacyConfig } from '../config-schema';
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

  const headers = useMemo(
    () => [
      { header: t('diagnosis', 'Diagnosis'), key: 'text' },
      { header: t('status', 'Status'), key: 'certainty' },
    ],
    [t],
  );

  const config = useConfig<PharmacyConfig>();
  const { medicationRequestBundles } = usePrescriptionDetails(encounterUuid, config.refreshInterval);

  const generateStatusTag = (medicationRequest) => {
    const combinedStatus = computeMedicationRequestCombinedStatus(
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

  if (isLoading) return <DataTableSkeleton />;
  if (error) return <ErrorState headerTitle={title} error={error} />;
  if (!diagnoses?.length) {
    return (
      <Layer className={styles.diagnosesContainer}>
        {medicationRequestBundles &&
          medicationRequestBundles.map((bundle) => (
            <Tile key={bundle.request.id} className={styles.prescriptionTile}>
              <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
                <ActionButtons
                  patientUuid={patientUuid}
                  encounterUuid={encounterUuid}
                  medicationRequestBundle={bundle}
                />
              </UserHasAccess>
              <MedicationEvent medicationEvent={bundle.request} status={generateStatusTag(bundle.request)} />
            </Tile>
          ))}

        <EmptyState headerTitle={title} displayText={t('visitFinalDiagnoses', 'Visit final diagnoses')} />
      </Layer>
    );
  }

  return (
    <Layer className={styles.diagnosesContainer}>
      {medicationRequestBundles &&
        medicationRequestBundles.map((bundle) => (
          <Tile key={bundle.request.id} className={styles.prescriptionTile}>
            <UserHasAccess privilege={PRIVILEGE_CREATE_DISPENSE}>
              <ActionButtons patientUuid={patientUuid} encounterUuid={encounterUuid} medicationRequestBundle={bundle} />
            </UserHasAccess>
            <MedicationEvent medicationEvent={bundle.request} status={generateStatusTag(bundle.request)} />
          </Tile>
        ))}

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
