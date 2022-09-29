import useSWR from "swr";
import {
  fhirBaseUrl,
  formatDate,
  openmrsFetch,
  openmrsObservableFetch,
  parseDate,
} from "@openmrs/esm-framework";
import {
  AllergyIntoleranceResponse,
  EncounterWithMedicationRequests,
  EncountersWithMedicationRequestsResponse,
  MedicationRequest,
  MedicationRequestResponse,
  EncounterOrders,
} from "../types";

export function useOrders(
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = ""
) {
  const url = `/ws/fhir2/R4/Encounter?_getpagesoffset=${pageOffset}&_count=${pageSize}&subject.name=${patientSearchTerm}&_revinclude=MedicationRequest:encounter&_has:MedicationRequest:encounter:intent=order&_sort=-date&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter`;
  const { data, error } = useSWR<
    { data: EncountersWithMedicationRequestsResponse },
    Error
  >(url, openmrsFetch);

  let orders: EncounterOrders[];
  if (data) {
    const entries = data?.data.entry;
    if (entries) {
      const fhirEncounters = entries.filter(
        (entry) => entry?.resource?.resourceType == "Encounter"
      );
      const fhirMedicationRequests = entries.filter(
        (entry) => entry?.resource?.resourceType == "MedicationRequest"
      );

      orders = fhirEncounters.map((encounter) => {
        const encounterOrders = fhirMedicationRequests.filter(
          (order) =>
            order.resource.encounter.reference ==
            "Encounter/" + encounter.resource.id
        );
        return buildEncounterOrders(
          encounter.resource,
          encounterOrders.map((order) => order.resource)
        );
      });
      orders.sort((a, b) => (a.created < b.created ? 1 : -1));
    } else {
      orders = [];
    }
  }

  return {
    orders,
    isError: error,
    isLoading: !orders && !error,
    totalOrders: data?.data.total,
  };
}

function buildEncounterOrders(
  encounter: EncounterWithMedicationRequests,
  orders: Array<EncounterWithMedicationRequests>
): EncounterOrders {
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patientName: encounter?.subject?.display,
    drugs: [
      ...new Set(
        orders.map((o) =>
          o.medicationReference
            ? o.medicationReference.display
            : o.medicationCodeableConcept?.text
        )
      ),
    ].join("; "),
    lastDispenser: "tbd",
    prescriber: [...new Set(orders.map((o) => o.requester.display))].join(", "),
    status: computeStatus(orders.map((o) => o.status)),
    patientUuid: encounter?.subject?.reference?.split("/")[1],
  };
}

function computeStatus(orderStatuses: Array<string>) {
  return orderStatuses.filter((s) => s)[0];
}

export function useOrderDetails(encounterUuid: string) {
  let medications = null;
  let isLoading = true;
  const { data, error } = useSWR<{ data: MedicationRequestResponse }, Error>(
    `${fhirBaseUrl}/MedicationRequest?encounter=${encounterUuid}`,
    openmrsFetch
  );

  if (data) {
    const orders = data?.data.entry;
    medications = orders?.map((order) => {
      return order.resource;
    });
  } else {
    medications = [];
  }
  isLoading = !medications && !error;

  return {
    medications,
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
