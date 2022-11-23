import { fhirBaseUrl, openmrsFetch, Session } from "@openmrs/esm-framework";
import dayjs from "dayjs";
import useSWR from "swr";
import { MedicationDispense, MedicationRequest, OrderConfig } from "../types";

export function saveMedicationDispense(
  medicationDispense: MedicationDispense,
  abortController: AbortController
) {
  // if we have an id, this is an update, otherwise it's a create
  const url = medicationDispense.id
    ? `${fhirBaseUrl}/MedicationDispense/${medicationDispense.id}`
    : `${fhirBaseUrl}/MedicationDispense`;

  const method = medicationDispense.id ? "PUT" : "POST";

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

// TODO: should more be stripped out of here when initializing... ie don't copy over all the display data?
export function initiateMedicationDispenseBody(
  medicationRequests: Array<MedicationRequest>,
  session: Session
) {
  let dispenseBody = [];
  medicationRequests.map((medicationRequest) => {
    let dispense = {
      resourceType: "MedicationDispense",
      status: "completed", // might need to change this to appropriate status
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
