import {
  fhirBaseUrl,
  openmrsFetch,
  Session,
  useSession,
} from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR from "swr";
import {
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationRequest,
  OrderConfig,
  StockDispenseRequest,
  ValueSet,
} from "../types";

export function saveMedicationDispense(
  medicationDispense: MedicationDispense,
  medicationDispenseStatus: MedicationDispenseStatus,
  abortController: AbortController
) {
  // if we have an id, this is an update, otherwise it's a create
  const url = medicationDispense.id
    ? `${fhirBaseUrl}/MedicationDispense/${medicationDispense.id}`
    : `${fhirBaseUrl}/MedicationDispense`;

  const method = medicationDispense.id ? "PUT" : "POST";

  medicationDispense.status = medicationDispenseStatus;

  // timestamp if needed
  if (medicationDispenseStatus === MedicationDispenseStatus.completed) {
    if (medicationDispense.whenHandedOver === null) {
      medicationDispense.whenHandedOver = dayjs();
    }
  }

  if (
    //   medicationDispenseStatus === MedicationDispenseStatus.in_progress ||  NOT YET IMPLEMENTED
    medicationDispenseStatus === MedicationDispenseStatus.completed
  ) {
    if (medicationDispense.whenPrepared === null) {
      medicationDispense.whenPrepared = dayjs();
    }
  }
  return openmrsFetch(url, {
    method: method,
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: medicationDispense,
  });
}

export function deleteMedicationDispense(medicationDispenseUuid: string) {
  return openmrsFetch(
    `${fhirBaseUrl}/MedicationDispense/${medicationDispenseUuid}`,
    {
      method: "DELETE",
    }
  );
}

export function useOrderConfig() {
  const { data, error, isValidating } = useSWR<{ data: OrderConfig }, Error>(
    `/ws/rest/v1/orderentryconfig`,
    openmrsFetch
  );
  return {
    orderConfigObject: data ? data.data : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function useReasonForPauseValueSet(uuid: string) {
  const valueSet = useValueSet(uuid);
  return { reasonForPauseValueSet: valueSet };
}

export function useReasonForCloseValueSet(uuid: string) {
  const valueSet = useValueSet(uuid);
  return { reasonForCloseValueSet: valueSet };
}

export function useSubstitutionTypeValueSet(uuid: string) {
  const valueSet = useValueSet(uuid);
  return { substitutionTypeValueSet: valueSet };
}

export function useSubstitutionReasonValueSet(uuid: string) {
  const valueSet = useValueSet(uuid);
  return { substitutionReasonValueSet: valueSet };
}

export function useValueSet(uuid: string) {
  const { data } = useSWR<{ data: ValueSet }, Error>(
    `${fhirBaseUrl}/ValueSet/${uuid}`,
    openmrsFetch
  );
  return data ? data.data : null;
}

// TODO: what about the issue with the repetitive reloading?
export function initiateMedicationDispenseBody(
  medicationRequest: MedicationRequest,
  session: Session,
  populateDispenseInformation: boolean
): MedicationDispense {
  let medicationDispense: MedicationDispense = {
    resourceType: "MedicationDispense",
    status: null,
    authorizingPrescription: [
      {
        reference: "MedicationRequest/" + medicationRequest.id,
        type: "MedicationRequest",
      },
    ],
    medicationReference: medicationRequest.medicationReference,
    medicationCodeableConcept: medicationRequest.medicationCodeableConcept,
    subject: medicationRequest.subject,
    performer: [
      {
        actor: {
          reference: session?.currentProvider
            ? `Practitioner/${session.currentProvider.uuid}`
            : "",
        },
      },
    ],
    location: {
      reference: session?.sessionLocation
        ? `Location/${session.sessionLocation.uuid}`
        : "",
    },
  };

  if (populateDispenseInformation) {
    medicationDispense = {
      ...medicationDispense,
      quantity: {
        value: medicationRequest.dispenseRequest?.quantity?.value,
        code: medicationRequest.dispenseRequest?.quantity?.code,
        unit: medicationRequest.dispenseRequest?.quantity?.unit,
        system: medicationRequest.dispenseRequest?.quantity?.system,
      },
      whenPrepared: null,
      whenHandedOver: null,
      dosageInstruction: [
        {
          text: medicationRequest.dosageInstruction[0].text,
          timing: medicationRequest.dosageInstruction[0].timing,
          asNeededBoolean: false,
          route: medicationRequest.dosageInstruction[0].route,
          doseAndRate: medicationRequest.dosageInstruction[0].doseAndRate
            ? medicationRequest.dosageInstruction[0].doseAndRate
            : [
                {
                  doseQuantity: {
                    value: null,
                    code: null,
                    unit: null,
                  },
                },
              ],
        },
      ],
      substitution: {
        wasSubstituted: false,
        reason: [
          {
            coding: [{ code: null }],
          },
        ],
        type: { coding: [{ code: null }] },
      },
    };
  }
  return medicationDispense;
}

export function useStockBatches(uuid: string) {
  const session = useSession();
  const formattedUuid = uuid ? uuid.split("/")[1] : "";
  const url = `/ws/rest/v1/stockmanagement/stockiteminventory?v=default&totalCount=true&drugUuid=${formattedUuid}
  &includeStrength=1&includeConceptRefIds=1&groupBy=LocationStockItemBatchNo&includeBatchNo=1&dispenseLocationUuid=${session?.sessionLocation.uuid}`;
  const { data, error, isValidating, isLoading } = useSWR<{ data: any }, Error>(
    uuid ? url : null,
    openmrsFetch
  );
  return {
    stockBatches: data ? data.data : [],
    isLoadingStock: isLoading,
    isError: error,
    isValidatingStock: isValidating,
  };
}

export function dispensePostProcessor(
  stockDispenseRequest: StockDispenseRequest,
  abortController: AbortController
) {
  const url = "/ws/rest/v1/stockmanagement/inventory-dispense";

  return openmrsFetch(url, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: stockDispenseRequest,
  });
}
