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

export function usePrescriptionsTable(
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = ""
) {
  const url = `/ws/fhir2/R4/Encounter?_getpagesoffset=${pageOffset}&_count=${pageSize}&subject.name=${patientSearchTerm}&_revinclude=MedicationRequest:encounter&_revinclude:iterate=MedicationDispense:prescription&_has:MedicationRequest:encounter:intent=order&_sort=-date&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter`;
  const { data, error } = useSWR<{ data: EncounterResponse }, Error>(
    url,
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
        .map((entry) => entry.resource as MedicationDispense);
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
        medicationRequests.map((o) =>
          o.medicationReference
            ? o.medicationReference.display
            : o.medicationCodeableConcept?.text
        )
      ),
    ].join("; "),
    lastDispenser: "tbd", // TODO calculate once MedicationDispense includes performer/dispenser
    prescriber: [
      ...new Set(medicationRequests.map((o) => o.requester.display)),
    ].join(", "),
    status: computeStatus(medicationRequests.map((o) => o.status)),
    patientUuid: encounter?.subject?.reference?.split("/")[1],
  };
}

function computeStatus(orderStatuses: Array<string>) {
  return orderStatuses.filter((s) => s)[0];
}

// TODO: think about better name for this method?
export function useOrderDetails(encounterUuid: string) {
  let requests: Array<MedicationRequest> = [];
  let dispenses: Array<MedicationDispense> = [];
  let prescriptionDate: Date;
  let isLoading = true;

  // TODO this fetch is duplicative; all the data necessary is fetched in the original request... we should refactor to use the original request, *but* I'm waiting on that because we may be refactoring the original request into something more performant, in which case we may still need this to be separate (MG)
  const { data, error } = useSWR<{ data: MedicationRequestResponse }, Error>(
    `${fhirBaseUrl}/MedicationRequest?encounter=${encounterUuid}&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter`,
    openmrsFetch
  );

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
      .sort(
        (a, b) =>
          parseDate(b.whenHandedOver).getTime() -
          parseDate(a.whenHandedOver).getTime()
      );
  }

  isLoading = !requests && !error;

  return {
    requests,
    dispenses,
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
