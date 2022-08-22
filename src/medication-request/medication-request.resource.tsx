import useSWR from "swr";
import {
  fhirBaseUrl,
  openmrsFetch,
  openmrsObservableFetch,
} from "@openmrs/esm-framework";
import { MedicationRequest, MedicationRequestResponse } from "../types";

export type Order = {
  id: string;
  created: string;
  patientName: string;
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
  patientUuid: string;
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
  medicationReference: {
    reference: string;
    type: string;
    display: string;
  };
  requester: {
    type: string;
    display: string;
    reference: string;
  };
  status: string;
}

export function useOrders(pageSize: number = 10, pageOffset: number = 0) {
  const url = `/ws/fhir2/R4/Encounter?_getpagesoffset=${pageOffset}&_count=${pageSize}&_revinclude=MedicationRequest:encounter&_has:MedicationRequest:encounter:intent=order&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter`;
  const { data, error } = useSWR<
    { data: FHIRMedicationRequestResponse },
    Error
  >(url, openmrsFetch);

  let orders = null;
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
  encounter: FHIREncounterOrder,
  orders: Array<FHIREncounterOrder>
): Order {
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patientName: encounter?.subject?.display,
    drugs: [...new Set(orders.map((o) => o.medicationReference.display))].join(
      ", "
    ),
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

  return {
    medications,
    isError: error,
    isLoading: !medications && !error,
  };
}
