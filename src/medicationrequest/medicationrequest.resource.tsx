import useSWR from "swr";
import { openmrsFetch } from "@openmrs/esm-framework";

export type Order = {
  id: string;
  created: string;
  patientName: string;
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
};

interface FHIRMedicationRequestResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    // Todo: split this into a union type. Possibly just use the types `fhir.Encounter` and `fhir.MedicationRequest`.
    resource: FHIREncounterOrder;
  }>;
}

interface FHIREncounterOrder {
  type: string;
  id: string;
  resourceType: string;
  period?: {
    start: string;
  };
  encounter: {
    reference: string;
  };
  subject: {
    type: string;
    display: string;
    reference: string;
  };
  requester: {
    type: string;
    display: string;
    reference: string;
  };
  status: string;
}

export function useOrders() {
  const url =
    "/ws/fhir2/R4/Encounter?_revinclude=MedicationRequest:encounter&_has:MedicationRequest:encounter:intent=order&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter";
  const { data, error } = useSWR<
    { data: FHIRMedicationRequestResponse },
    Error
  >(url, openmrsFetch);

  let orders = null;
  if (data) {
    const entries = data?.data.entry;
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
  }

  return {
    orders,
    isError: error,
    isLoading: !data && !error,
  };
}

function buildEncounterOrders(
  encounter: FHIREncounterOrder,
  orders: Array<FHIREncounterOrder>
): Order {
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patientName: encounter?.subject?.display,
    drugs: "tbd",
    lastDispenser: "tbd",
    prescriber: [...new Set(orders.map((o) => o.requester.display))].join(", "),
    status: computeStatus(orders.map((o) => o.status)),
  };
}

function computeStatus(orderStatuses: Array<string>) {
  return orderStatuses.filter((s) => s)[0];
}
