import useSWR from "swr";
import { openmrsFetch, Visit } from "@openmrs/esm-framework";
import { FHIRMedicationRequestResponse, FHIREncounterOrder } from "../types";

export type MedicationOrder = {
  id: string;
  resourceType: string;
  status: string;
  encounter: string;
  requester: string;
};

export type EncounterOrder = {
  id: string;
  created: string;
  patientName: string;
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
};

export function useOrders() {
  const url =
    "/ws/fhir2/R4/Encounter?_revinclude=MedicationRequest:encounter&_has:MedicationRequest:encounter:intent=order&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter";
  const { data, error } = useSWR<
    { data: FHIRMedicationRequestResponse },
    Error
  >(url, openmrsFetch);

  const formattedEncounters = data?.data.entry.filter(
    (entry) => entry?.resource?.resourceType == "Encounter"
  );

  const formattedMedicationRequests = data?.data.entry.filter(
    (entry) => entry?.resource?.resourceType == "MedicationRequest"
  );

  const orders = formattedEncounters.map((encounter) => {
    encounter.resource;
    const encounterOrders = formattedMedicationRequests.filter(
      (order) =>
        order.resource.encounter.reference ==
        "Encounter/" + encounter.resource.id
    );
    return buildEncounterOrders(
      encounter.resource,
      encounterOrders.map((order) => order.resource)
    );
  });

  return {
    orders,
    isError: error,
    isLoading: !data && !error,
  };
}

function buildEncounterOrders(
  encounter: FHIREncounterOrder,
  orders: Array<FHIREncounterOrder>
) {}

function mapEncounterProperties(encounter: FHIREncounterOrder): EncounterOrder {
  return {
    id: encounter?.id,
    created: encounter?.period?.start,
    patientName: encounter?.subject?.display,
    prescriber: encounter?.requester?.display,
    drugs: "tbd",
    lastDispenser: "tbd",
    status: encounter?.status,
  };
}

function mapOrderProperties(order: FHIREncounterOrder): MedicationOrder {
  return {
    id: order?.id,
    resourceType: order?.resourceType,
    status: order?.status,
    encounter: order?.encounter?.reference,
    requester: order?.requester?.display,
  };
}
