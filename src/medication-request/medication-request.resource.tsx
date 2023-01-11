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
  getPrescriptionTableEndpoint,
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
} from "../utils";

export function usePrescriptionsTable(
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = "",
  status: string = ""
) {
  const { data, mutate, error } = useSWR<{ data: EncounterResponse }, Error>(
    getPrescriptionTableEndpoint(
      pageOffset,
      pageSize,
      patientSearchTerm,
      status
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
          medicationDispensesForMedicationRequests
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
  medicationDispense: Array<MedicationDispense>
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
    status: computeStatus(medicationRequests.map((o) => o.status)),
    patientUuid: encounter?.subject?.reference?.split("/")[1],
  };
}

function computeStatus(orderStatuses: Array<string>) {
  if (orderStatuses.includes("active")) {
    // if any are active, return active
    return "active";
  } else if (orderStatuses.includes("stopped")) {
    // if none are active, and any are stopped, return expired
    return "expired";
  }
  if (orderStatuses.includes("cancelled")) {
    // if none are active or stopped, then if any are cancelled, return cancelled
    return "cancelled";
  } else {
    // otherwise unknown
    return "unknown";
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
      .filter((entry) => entry?.resource?.resourceType == "Encounter")
      .map((entry) => entry.resource as Encounter);

    // by definition of the request (search by encounter) there should be one and only one encounter
    prescriptionDate = parseDate(encounter[0]?.period.start);

    requests = results
      ?.filter((entry) => entry?.resource?.resourceType == "MedicationRequest")
      .map((entry) => entry.resource as MedicationRequest);
    dispenses = results
      ?.filter((entry) => entry?.resource?.resourceType == "MedicationDispense")
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
