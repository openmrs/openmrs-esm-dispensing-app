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
} from "../types";
import {
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getPrescriptionTableActiveMedicationRequestsEndpoint,
  getPrescriptionTableAllMedicationRequestsEndpoint,
} from "../utils";
import dayjs from "dayjs";

export function usePrescriptionsTable(
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = "",
  location: string = "",
  status: string = "",
  medicationRequestExpirationPeriodInDays: number
) {
  const { data, mutate, error } = useSWR<{ data: EncounterResponse }, Error>(
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
        .sort(
          (a, b) =>
            parseDate(b.whenHandedOver).getTime() -
            parseDate(a.whenHandedOver).getTime()
        );
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
    mutate,
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
    patientName: encounter?.subject?.display,
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
    status: computePrescriptionStatus(
      medicationRequests.map((o) => o.status),
      encounter?.period?.start,
      medicationRequestExpirationPeriodInDays
    ),
    patientUuid: encounter?.subject?.reference?.split("/")[1],
    location: encounter?.location
      ? encounter?.location[0]?.location.display
      : null,
  };
}

export function computePrescriptionStatus(
  orderStatuses: Array<string>,
  encounterDatetime: string,
  medicationRequestExpirationPeriodInDays
) {
  // first, test the encounter against the expiry period
  var isExpired = false;
  if (
    encounterDatetime &&
    dayjs(encounterDatetime).isBefore(
      dayjs(new Date())
        .startOf("day")
        .subtract(medicationRequestExpirationPeriodInDays, "day")
    )
  ) {
    isExpired = true;
  }

  // handle cases when the overall set isn't expired
  if (!isExpired) {
    if (orderStatuses.includes("active") || orderStatuses.includes("stopped")) {
      // if any are active or expired, set as active (since, confusingly, we aren't using the  ORDER API idea of stopped/autoexpired for dispensing purposes
      return "active";
    } else if (orderStatuses.includes("completed")) {
      // otherwise, if any are completed, return completed
      return "completed";
    } else if (orderStatuses.includes("cancelled")) {
      // otherwise, if any are cancelled, return cancelled
      return "cancelled";
    } else {
      return "unknown";
    }
  } else {
    // handle cases where the overall set is expired
    if (orderStatuses.every((status) => status === "cancelled")) {
      // if every one is cancelled, return cancelled
      return "cancelled";
    } else if (
      orderStatuses.every(
        (status) => status === "completed" || status === "cancelled"
      )
    ) {
      // if every one is completed or cancelled, return completed
      return "completed";
    } else {
      /// otherwise, expired
      return "expired";
    }
  }
}

export function usePrescriptionDetails(encounterUuid: string) {
  let requests: Array<MedicationRequest> = [];
  let dispenses: Array<MedicationDispense> = [];
  let prescriptionDate: Date;
  let isLoading = true;

  // TODO this fetch is duplicative; all the data necessary is fetched in the original request... we could refactor to use the original request, *but* I'm waiting on that because we may be refactoring the original request into something more performant, in which case would make sense for this to be separate (MG)
  const { data, mutate, error } = useSWR<
    { data: MedicationRequestResponse },
    Error
  >(getPrescriptionDetailsEndpoint(encounterUuid), openmrsFetch);

  if (data) {
    const results = data?.data.entry;

    const encounter = results
      ?.filter((entry) => entry?.resource?.resourceType == "Encounter")
      .map((entry) => entry.resource as Encounter);

    if (encounter) {
      // by definition of the request (search by encounter) there should be one and only one encounter
      prescriptionDate = parseDate(encounter[0]?.period.start);

      requests = results
        ?.filter(
          (entry) => entry?.resource?.resourceType == "MedicationRequest"
        )
        .map((entry) => entry.resource as MedicationRequest);
      dispenses = results
        ?.filter(
          (entry) => entry?.resource?.resourceType == "MedicationDispense"
        )
        .map((entry) => entry.resource as MedicationDispense)
        .sort((a, b) => {
          const dateDiff =
            parseDate(b.whenHandedOver).getTime() -
            parseDate(a.whenHandedOver).getTime();
          if (dateDiff !== 0) {
            return dateDiff;
          } else {
            return a.id.localeCompare(b.id); // just to enforce a standard order if two dates are equals
          }
        });
    }
  }

  isLoading = !requests && !error;

  return {
    requests,
    dispenses,
    prescriptionDate,
    mutate,
    isError: error,
    isLoading,
  };
}

export function usePatientAllergies(patientUuid: string) {
  const { data, error } = useSWR<{ data: AllergyIntoleranceResponse }, Error>(
    `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`,
    openmrsFetch
  );

  let allergiesArray = [];
  if (data) {
    const allergyIntolerances = data?.data.entry;
    allergyIntolerances?.map((allergy) => {
      return allergiesArray.push(allergy.resource?.code?.text);
    });
  }

  let allergies = null;
  if (allergiesArray.length > 0) {
    allergies = allergiesArray.join(", ");
  } else {
    allergies = "No known allergies";
  }

  return {
    allergies: allergies,
    totalAllergies: data?.data.total,
    isError: error,
    isLoading: !allergiesArray && !error,
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
