import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, parseDate } from '@openmrs/esm-framework';
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
} from '../types';
import {
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getPrescriptionTableActiveMedicationRequestsEndpoint,
  getPrescriptionTableAllMedicationRequestsEndpoint,
  sortMedicationDispensesByWhenHandedOver,
  computePrescriptionStatusMessageCode,
  getAssociatedMedicationDispenses,
} from '../utils';
import dayjs from 'dayjs';
import { JSON_MERGE_PATH_MIME_TYPE, OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS } from '../constants';
import { useMemo } from 'react';

export function usePrescriptionsTable(
  loadData: boolean,
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = '',
  location: string = '',
  status: string = '',
  medicationRequestExpirationPeriodInDays: number,
  refreshInterval: number,
) {
  const { data, error } = useSWR<{ data: EncounterResponse }, Error>(
    loadData
      ? status === 'ACTIVE'
        ? getPrescriptionTableActiveMedicationRequestsEndpoint(
            pageOffset,
            pageSize,
            dayjs(new Date()).startOf('day').subtract(medicationRequestExpirationPeriodInDays, 'day').toISOString(),
            patientSearchTerm,
            location,
          )
        : getPrescriptionTableAllMedicationRequestsEndpoint(pageOffset, pageSize, patientSearchTerm, location)
      : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  let prescriptionsTableRows: PrescriptionsTableRow[];
  if (data) {
    const entries = data?.data.entry;
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

  return {
    prescriptionsTableRows,
    error: error,
    isLoading: !prescriptionsTableRows && !error,
    totalOrders: data?.data.total,
  };
}

function buildPrescriptionsTableRow(
  encounter: Encounter,
  medicationRequests: Array<MedicationRequest>,
  medicationDispense: Array<MedicationDispense>,
  medicationRequestExpirationPeriodInDays: number,
): PrescriptionsTableRow {
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
    status: computePrescriptionStatusMessageCode(medicationRequests, medicationRequestExpirationPeriodInDays),
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
    const medicationRequestBundles: Array<MedicationRequestBundle> = [];
    let prescriptionDate: Date;
    if (data) {
      const results = data?.data.entry;

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
    }

    return { medicationRequestBundles, prescriptionDate };
  }, [data]);

  return {
    medicationRequestBundles,
    prescriptionDate,
    ...rest,
  };
}

export function usePatientAllergies(patientUuid: string, refreshInterval) {
  const { data, error } = useSWR<{ data: AllergyIntoleranceResponse }, Error>(
    `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  const allergies = [];
  if (data) {
    const entries = data?.data.entry;
    entries?.map((allergy) => {
      return allergies.push(allergy.resource);
    });
  }

  return {
    allergies,
    totalAllergies: data?.data.total,
    error,
  };
}

// supports passing just the uuid/code or the entire reference, ie either: "MedicationReference/123-abc" or "123-abc"
export function useMedicationRequest(reference: string, refreshInterval) {
  reference = reference
    ? reference.startsWith('MedicationRequest')
      ? reference
      : `MedicationRequest/${reference}`
    : null;

  const { data } = useSWR<{ data: MedicationRequest }, Error>(
    reference ? `${fhirBaseUrl}/${reference}` : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );
  return {
    medicationRequest: data ? data.data : null,
  };
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
