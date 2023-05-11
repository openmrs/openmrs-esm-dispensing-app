import useSWR from "swr";
import { fhirBaseUrl, openmrsFetch, parseDate } from "@openmrs/esm-framework";
import {
  AllergyIntoleranceResponse,
  EncounterResponse,
  MedicationRequest,
  MedicationRequestResponse,
  PrescriptionsTableRow,
  MedicationDispense,
  Encounter,
  MedicationRequestFulfillerStatus,
  MedicationRequestBundle,
} from "../types";
import {
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getPrescriptionTableActiveMedicationRequestsEndpoint,
  getPrescriptionTableAllMedicationRequestsEndpoint,
  sortMedicationDispensesByDateRecorded,
  computePrescriptionStatusMessageCode,
  getAssociatedMedicationDispenses,
} from "../utils";
import dayjs from "dayjs";
import {
  JSON_MERGE_PATH_MIME_TYPE,
  OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
} from "../constants";

export function usePrescriptionsTable(
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = "",
  location: string = "",
  status: string = "",
  medicationRequestExpirationPeriodInDays: number
) {
  const { data, error } = useSWR<{ data: EncounterResponse }, Error>(
    status === "ACTIVE"
      ? getPrescriptionTableActiveMedicationRequestsEndpoint(
          pageOffset,
          pageSize,
          dayjs(new Date())
            .startOf("day")
            .subtract(medicationRequestExpirationPeriodInDays, "day")
            .toISOString(),
          patientSearchTerm,
          location
        )
      : getPrescriptionTableAllMedicationRequestsEndpoint(
          pageOffset,
          pageSize,
          patientSearchTerm,
          location
        ),
    openmrsFetch
  );

  let prescriptionsTableRows: PrescriptionsTableRow[];
  if (data) {
    const entries = data?.data.entry;
    if (entries) {
      const encounters = entries
        .filter((entry) => entry?.resource?.resourceType == "Encounter")
        .map((entry) => entry.resource as Encounter);
      const medicationRequests = entries
        .filter((entry) => entry?.resource?.resourceType == "MedicationRequest")
        .map((entry) => entry.resource as MedicationRequest);
      const medicationDispenses = entries
        .filter(
          (entry) => entry?.resource?.resourceType == "MedicationDispense"
        )
        .map((entry) => entry.resource as MedicationDispense)
        .sort(sortMedicationDispensesByDateRecorded);
      prescriptionsTableRows = encounters.map((encounter) => {
        const medicationRequestsForEncounter = medicationRequests.filter(
          (medicationRequest) =>
            medicationRequest.encounter.reference == "Encounter/" + encounter.id
        );

        const medicationRequestReferences = medicationRequestsForEncounter.map(
          (medicationRequest) => "MedicationRequest/" + medicationRequest.id
        );
        const medicationDispensesForMedicationRequests =
          medicationDispenses.filter((medicationDispense) =>
            medicationRequestReferences.includes(
              medicationDispense.authorizingPrescription[0]?.reference
            )
          );
        return buildPrescriptionsTableRow(
          encounter,
          medicationRequestsForEncounter,
          medicationDispensesForMedicationRequests,
          medicationRequestExpirationPeriodInDays
        );
      });
      prescriptionsTableRows.sort((a, b) => (a.created < b.created ? 1 : -1));
    } else {
      prescriptionsTableRows = [];
    }
  }

  return {
    prescriptionsTableRows,
    isError: error,
    isLoading: !prescriptionsTableRows && !error,
    totalOrders: data?.data.total,
  };
}

function buildPrescriptionsTableRow(
  encounter: Encounter,
  medicationRequests: Array<MedicationRequest>,
  medicationDispense: Array<MedicationDispense>,
  medicationRequestExpirationPeriodInDays: number
): PrescriptionsTableRow {
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patient: {
      name: encounter?.subject?.display,
      uuid: encounter?.subject?.reference?.split("/")[1],
    },
    drugs: [
      ...new Set(
        medicationRequests
          .map((medicationRequest) =>
            getMedicationDisplay(
              getMedicationReferenceOrCodeableConcept(medicationRequest)
            )
          )
          .sort((a, b) => {
            return a.localeCompare(b);
          })
      ),
    ].join("; "),
    lastDispenser:
      medicationDispense &&
      medicationDispense[0]?.performer &&
      medicationDispense[0]?.performer[0]?.actor.display,
    prescriber: [
      ...new Set(medicationRequests.map((o) => o.requester.display)),
    ].join(", "),
    status: computePrescriptionStatusMessageCode(
      medicationRequests,
      medicationRequestExpirationPeriodInDays
    ),
    location: encounter?.location
      ? encounter?.location[0]?.location.display
      : null,
  };
}

export function usePrescriptionDetails(encounterUuid: string) {
  let medicationRequestBundles: Array<MedicationRequestBundle> = [];
  let prescriptionDate: Date;
  let isLoading = true;

  const { data, error } = useSWR<{ data: MedicationRequestResponse }, Error>(
    getPrescriptionDetailsEndpoint(encounterUuid),
    openmrsFetch
  );

  if (data) {
    const results = data?.data.entry;

    const encounter = results
      ?.filter((entry) => entry?.resource?.resourceType == "Encounter")
      .map((entry) => entry.resource as Encounter);

    if (encounter) {
      // by definition of the request (search by encounter) there should be one and only one encounter
      prescriptionDate = parseDate(encounter[0]?.period.start);

      const medicationRequests = results
        ?.filter(
          (entry) => entry?.resource?.resourceType == "MedicationRequest"
        )
        .map((entry) => entry.resource as MedicationRequest);

      const medicationDispenses = results
        ?.filter(
          (entry) => entry?.resource?.resourceType == "MedicationDispense"
        )
        .map((entry) => entry.resource as MedicationDispense)
        .sort(sortMedicationDispensesByDateRecorded);

      medicationRequests.every((medicationRequest) =>
        medicationRequestBundles.push({
          request: medicationRequest,
          dispenses: getAssociatedMedicationDispenses(
            medicationRequest,
            medicationDispenses
          ).sort(sortMedicationDispensesByDateRecorded),
        })
      );
    }
  }

  isLoading =
    (!medicationRequestBundles || medicationRequestBundles.length == 0) &&
    !error;

  return {
    medicationRequestBundles,
    prescriptionDate,
    isError: error,
    isLoading,
  };
}

export function usePatientAllergies(patientUuid: string) {
  const { data, error } = useSWR<{ data: AllergyIntoleranceResponse }, Error>(
    `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`,
    openmrsFetch
  );

  let allergies = [];
  if (data) {
    const entries = data?.data.entry;
    entries?.map((allergy) => {
      return allergies.push(allergy.resource);
    });
  }

  return {
    allergies,
    totalAllergies: data?.data.total,
    isError: error,
  };
}

// supports passing just the uuid/code or the entire reference, ie either: "MedicationReference/123-abc" or "123-abc"
// TODO: do we need a refresh interval?
export function useMedicationRequest(reference: string) {
  reference = reference
    ? reference.startsWith("MedicationRequest")
      ? reference
      : `MedicationRequest/${reference}`
    : null;

  const { data } = useSWR<{ data: MedicationRequest }, Error>(
    reference ? `${fhirBaseUrl}/${reference}` : null,
    openmrsFetch
  );
  return {
    medicationRequest: data ? data.data : null,
  };
}

export function updateMedicationRequestFulfillerStatus(
  medicationRequestUuid: string,
  fulfillerStatus: MedicationRequestFulfillerStatus
) {
  const url = `${fhirBaseUrl}/MedicationRequest/${medicationRequestUuid}`;

  return openmrsFetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": JSON_MERGE_PATH_MIME_TYPE,
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
