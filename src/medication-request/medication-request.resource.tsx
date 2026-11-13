import { useMemo } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, parseDate, restBaseUrl } from '@openmrs/esm-framework';
import {
  JSON_MERGE_PATH_MIME_TYPE,
  OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
  PRESCRIPTIONS_TABLE_ENDPOINT,
} from '../constants';
import {
  type AllergyIntoleranceResponse,
  type EncounterResponse,
  type MedicationRequest,
  type MedicationRequestResponse,
  type PrescriptionsTableRow,
  type MedicationDispense,
  type Encounter,
  type MedicationRequestFulfillerStatus,
  type MedicationRequestBundle,
  type PrescriptionStage,
  type SimpleLocation,
} from '../types';
import {
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getPrescriptionTableEndpoint,
  sortMedicationDispensesByWhenHandedOver,
  computePrescriptionStatusMessageCode,
  computePrescriptionStage,
  getAssociatedMedicationDispenses,
} from '../utils';

export function usePrescriptionsTable(
  loadData: boolean,
  customPrescriptionsTableEndpoint: string = '',
  status: string = '',
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = '',
  locations: SimpleLocation[] = [],
  medicationRequestExpirationPeriodInDays: number,
  refreshInterval: number,
) {
  const { data, error } = useSWR<{ data: EncounterResponse }, Error>(
    loadData
      ? getPrescriptionTableEndpoint(
          customPrescriptionsTableEndpoint,
          status,
          pageOffset,
          pageSize,
          dayjs(new Date()).startOf('day').subtract(medicationRequestExpirationPeriodInDays, 'day').toISOString(),
          patientSearchTerm,
          locations?.map((location) => location.id).join(','),
        )
      : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  let prescriptionsTableRows: PrescriptionsTableRow[];
  if (data) {
    prescriptionsTableRows = buildPrescriptionsTableRows(data?.data.entry, medicationRequestExpirationPeriodInDays);
  }

  return {
    prescriptionsTableRows,
    error: error,
    isLoading: !prescriptionsTableRows && !error,
    totalOrders: data?.data.total,
  };
}

function buildPrescriptionsTableRows(
  entries: EncounterResponse['entry'],
  medicationRequestExpirationPeriodInDays: number,
): PrescriptionsTableRow[] {
  let prescriptionsTableRows: PrescriptionsTableRow[];
  {
    if (entries) {
      const encounters = entries
        .filter((entry) => entry?.resource?.resourceType == 'Encounter')
        .map((entry) => entry.resource as Encounter);
      const medicationRequests = entries
        .filter((entry) => entry?.resource?.resourceType == 'MedicationRequest')
        .map((entry) => entry.resource as MedicationRequest);
      const medicationDispenses = entries
        .filter((entry) => entry?.resource?.resourceType == 'MedicationDispense')
        .map((entry) => entry.resource as MedicationDispense)
        .sort(sortMedicationDispensesByWhenHandedOver);
      prescriptionsTableRows = encounters.map((encounter) => {
        const medicationRequestsForEncounter = medicationRequests.filter(
          (medicationRequest) => medicationRequest.encounter.reference == 'Encounter/' + encounter.id,
        );

        const medicationRequestReferences = medicationRequestsForEncounter.map(
          (medicationRequest) => 'MedicationRequest/' + medicationRequest.id,
        );
        const medicationDispensesForMedicationRequests = medicationDispenses.filter((medicationDispense) =>
          medicationRequestReferences.includes(medicationDispense.authorizingPrescription[0]?.reference),
        );
        return buildPrescriptionsTableRow(
          encounter,
          medicationRequestsForEncounter,
          medicationDispensesForMedicationRequests,
          medicationRequestExpirationPeriodInDays,
        );
      });
      prescriptionsTableRows.sort((a, b) => (a.created < b.created ? 1 : -1));
    } else {
      prescriptionsTableRows = [];
    }
  }
  return prescriptionsTableRows;
}

/** Page size the server allows when loading every prescription for the stage lists and tiles. */
const STAGE_PAGE_SIZE = 100;
/** Upper bound on prescriptions loaded for the stage lists, to keep the page responsive. */
const STAGE_MAX_PRESCRIPTIONS = 2000;

async function fetchAllPrescriptionPages(url: string) {
  const entries: EncounterResponse['entry'] = [];
  let offset = 0;
  let total = 0;
  do {
    const response = await openmrsFetch<EncounterResponse>(`${url}&_getpagesoffset=${offset}`);
    entries.push(...(response.data?.entry ?? []));
    total = response.data?.total ?? 0;
    offset += STAGE_PAGE_SIZE;
  } while (offset < total && offset < STAGE_MAX_PRESCRIPTIONS);
  return { entries, total };
}

/**
 * Every prescription from the last `medicationRequestExpirationPeriodInDays` days, sorted into the
 * lab-style stages (Ordered, Picked, Dispensed, Declined). Backs the stage tabs and tiles.
 */
export function usePrescriptionsByStage(
  loadData: boolean,
  patientSearchTerm: string = '',
  locations: SimpleLocation[] = [],
  medicationRequestExpirationPeriodInDays: number,
  refreshInterval: number,
) {
  const since = dayjs(new Date()).startOf('day').subtract(medicationRequestExpirationPeriodInDays, 'day').toISOString();
  const location = locations?.map((l) => l.id).join(',');
  // starts with the table endpoint so revalidate() refreshes it after every pick, dispense or decline
  const url = loadData
    ? `${fhirBaseUrl}/${PRESCRIPTIONS_TABLE_ENDPOINT}&_count=${STAGE_PAGE_SIZE}&date=ge${since}` +
      (patientSearchTerm ? `&patientSearchTerm=${patientSearchTerm}` : '') +
      (location ? `&location=${location}` : '')
    : null;
  const { data, error } = useSWR(url, fetchAllPrescriptionPages, { refreshInterval });

  const rows = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return (buildPrescriptionsTableRows(data.entries, medicationRequestExpirationPeriodInDays) ?? []).filter(
      (row) => row.stage,
    );
  }, [data, medicationRequestExpirationPeriodInDays]);

  const counts = useMemo(() => {
    const result: Record<PrescriptionStage, number> = { ordered: 0, picked: 0, dispensed: 0, declined: 0 };
    rows?.forEach((row) => (result[row.stage] += 1));
    return result;
  }, [rows]);

  return {
    rows,
    counts,
    error,
    isLoading: !rows && !error,
    isTruncated: (data?.total ?? 0) > STAGE_MAX_PRESCRIPTIONS,
  };
}

function buildPrescriptionsTableRow(
  encounter: Encounter,
  medicationRequests: Array<MedicationRequest>,
  medicationDispense: Array<MedicationDispense>,
  medicationRequestExpirationPeriodInDays: number,
): PrescriptionsTableRow {
  const stage = computePrescriptionStage(
    medicationRequests,
    medicationDispense,
    medicationRequestExpirationPeriodInDays,
  );
  // a dispensed prescription whose order is still running reads "Dispensed" rather than "Active"
  const status = computePrescriptionStatusMessageCode(medicationRequests, medicationRequestExpirationPeriodInDays);
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patient: {
      name: encounter?.subject?.display,
      uuid: encounter?.subject?.reference?.split('/')[1],
    },
    drugs: [
      ...new Set(
        medicationRequests
          .map((medicationRequest) => getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationRequest)))
          .sort((a, b) => {
            return a.localeCompare(b);
          }),
      ),
    ].join('; '),
    lastDispenser:
      medicationDispense && medicationDispense[0]?.performer && medicationDispense[0]?.performer[0]?.actor.display,
    prescriber: [...new Set(medicationRequests.map((o) => o.requester.display))].join(', '),
    status: stage === 'dispensed' && status === 'active' ? 'dispensed' : status,
    stage,
    location: encounter?.location ? encounter?.location[0]?.location.display : null,
  };
}

export function usePrescriptionDetails(encounterUuid: string, refreshInterval = null) {
  const { data, ...rest } = useSWR<{ data: MedicationRequestResponse }, Error>(
    getPrescriptionDetailsEndpoint(encounterUuid),
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  const { medicationRequestBundles, prescriptionDate } = useMemo(() => {
    if (data) {
      return medicationRequestResponseToPrescriptionDetails(data.data.entry);
    } else {
      return { medicationRequestBundles: [], prescriptionDate: null };
    }
  }, [data]);

  return {
    medicationRequestBundles,
    prescriptionDate,
    ...rest,
  };
}

/**
 * fetches prescription details of a given encounter directly via openmrsFetch (instead of useSWR)
 * @param encounterUuid
 * @returns
 */
export async function getPrescriptionDetails(encounterUuid: string) {
  const result = await openmrsFetch<MedicationRequestResponse>(getPrescriptionDetailsEndpoint(encounterUuid));
  const {
    data: { entry },
  } = result;
  return medicationRequestResponseToPrescriptionDetails(entry);
}

function medicationRequestResponseToPrescriptionDetails(
  results: { resource: MedicationRequest | MedicationDispense }[],
) {
  const medicationRequestBundles: Array<MedicationRequestBundle> = [];
  let prescriptionDate: Date;

  const encounter = results
    ?.filter((entry) => entry?.resource?.resourceType == 'Encounter')
    .map((entry) => entry.resource as Encounter);

  if (encounter) {
    // by definition of the request (search by encounter) there should be one and only one encounter
    prescriptionDate = parseDate(encounter[0]?.period.start);

    const medicationRequests = results
      ?.filter((entry) => entry?.resource?.resourceType == 'MedicationRequest')
      .map((entry) => entry.resource as MedicationRequest);

    const medicationDispenses = results
      ?.filter((entry) => entry?.resource?.resourceType == 'MedicationDispense')
      .map((entry) => entry.resource as MedicationDispense)
      .sort(sortMedicationDispensesByWhenHandedOver);

    medicationRequests.every((medicationRequest) =>
      medicationRequestBundles.push({
        request: medicationRequest,
        dispenses: getAssociatedMedicationDispenses(medicationRequest, medicationDispenses).sort(
          sortMedicationDispensesByWhenHandedOver,
        ),
      }),
    );
  }

  return { medicationRequestBundles, prescriptionDate };
}

export function usePatientAllergies(patientUuid: string, refreshInterval) {
  const { data, error, isLoading } = useSWR<{ data: AllergyIntoleranceResponse }, Error>(
    `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  const allergies = data?.data.entry?.map((allergy) => allergy.resource) ?? [];

  return {
    allergies,
    totalAllergies: data?.data.total,
    error,
    isLoading,
  };
}

// supports passing just the uuid/code or the entire reference, ie either: "MedicationReference/123-abc" or "123-abc"
export function useMedicationRequest(reference: string, refreshInterval) {
  reference = reference
    ? reference.startsWith('MedicationRequest')
      ? reference
      : `MedicationRequest/${reference}`
    : null;

  const { data, isLoading } = useSWR<{ data: MedicationRequest }, Error>(
    reference ? `${fhirBaseUrl}/${reference}` : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );
  return {
    medicationRequest: data ? data.data : null,
    isLoading,
  };
}

/**
 * Sets the order's fulfiller status and comment through the REST API, the way the Laboratory app
 * does. The comment ("Picked by ...", the reason for declining) is shown with the order.
 */
export function updateOrderFulfillerDetails(
  orderUuid: string,
  fulfillerStatus: MedicationRequestFulfillerStatus,
  fulfillerComment?: string,
) {
  return openmrsFetch(`${restBaseUrl}/order/${orderUuid}/fulfillerdetails/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { fulfillerStatus, ...(fulfillerComment ? { fulfillerComment } : {}) },
  });
}

export function updateMedicationRequestFulfillerStatus(
  medicationRequestUuid: string,
  fulfillerStatus: MedicationRequestFulfillerStatus,
) {
  const url = `${fhirBaseUrl}/MedicationRequest/${medicationRequestUuid}`;

  return openmrsFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': JSON_MERGE_PATH_MIME_TYPE,
    },
    body: {
      extension: [
        {
          url: OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
          valueCode: fulfillerStatus,
        },
      ],
    },
  });
}
