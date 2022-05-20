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

  let formattedEncounters =
    data?.data?.total > 0
      ? data?.data.entry
          .filter((entry) => entry?.resource?.resourceType == "Encounter")
          .map((entry) => entry.resource ?? [])
          .map(mapEncounterProperties)
      : null;

  const formattedMedicationRequests =
    data?.data?.total > 0
      ? data?.data.entry
          .filter(
            (entry) => entry?.resource?.resourceType == "MedicationRequest"
          )
          .map((entry) => entry.resource ?? [])
          .map(mapOrderProperties)
      : null;

  if (formattedEncounters?.length && formattedMedicationRequests?.length) {
    formattedEncounters.forEach((encounter) => {
      let encounterUuid = encounter.id;
      const encounterOrders = formattedMedicationRequests.filter(function (
        order
      ) {
        return order.encounter == "Encounter/" + encounter.id;
      });

      encounterOrders.forEach((order) => {
        encounter.prescriber = order.requester;
        encounter.status = order.status;
      });
    });
  }
  return {
    orders: data ? formattedEncounters : null,
    isError: error,
    isLoading: !data && !error,
  };
}

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
