import { fhirBaseUrl, openmrsFetch, Session } from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR from "swr";
import { MedicationDispense, MedicationRequest, OrderConfig } from "../types";

export function saveMedicationDispense(
  medicationDispense: MedicationDispense,
  abortController: AbortController
) {
  return openmrsFetch(`${fhirBaseUrl}/MedicationDispense`, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: medicationDispense,
  });
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

export function initiateMedicationDispenseBody(
  medicationRequests: Array<MedicationRequest>,
  session: Session
) {
  let dispenseBody = [];
  medicationRequests.map((medicationRequest) => {
    let dispense = {
      resourceType: "MedicationDispense",
      status: "on-hold", // might need to change this to appropriate status
      medicationReference: medicationRequest.medicationReference,
      medicationCodeableConcept: medicationRequest.medicationCodeableConcept,
      subject: medicationRequest.subject,
      performer: [
        {
          actor: {
            reference: medicationRequest.requester.reference,
          },
        },
      ],
      // location: {
      //   reference: session?.sessionLocation?.uuid,
      // },
      type: {
        coding: [
          {
            code: "04affd1a-49ab-44e5-a6d1-c0a3fffceb7d", // what is this?
          },
        ],
      },
      quantity: {
        value: medicationRequest.dispenseRequest.quantity.value,
        unit: medicationRequest.dispenseRequest.quantity.unit,
        code: medicationRequest.dispenseRequest.quantity.code,
      },
      whenPrepared: dayjs(),
      whenHandedOver: dayjs(),
      dosageInstruction: [
        {
          text: medicationRequest.dosageInstruction[0].text,
          timing: medicationRequest.dosageInstruction[0].timing,
          asNeededBoolean: false,
          route: medicationRequest.dosageInstruction[0].route,
          doseAndRate: medicationRequest.dosageInstruction[0].doseAndRate,
        },
      ],
      substitution: {
        wasSubstituted: false,
      },
    };
    dispenseBody.push(dispense);
  });

  return dispenseBody;
}
