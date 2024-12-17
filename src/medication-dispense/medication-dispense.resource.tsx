import dayjs from 'dayjs';
import useSWR from 'swr';
import { fhirBaseUrl, restBaseUrl, openmrsFetch, type Session } from '@openmrs/esm-framework';
import {
  type MedicationDispense,
  type MedicationDispenseStatus,
  type MedicationRequest,
  type OrderConfig,
  type Provider,
  type ProviderRequestResponse,
  type ValueSet,
} from '../types';

export function saveMedicationDispense(
  medicationDispense: MedicationDispense,
  medicationDispenseStatus: MedicationDispenseStatus,
  abortController: AbortController,
) {
  // if we have an id, this is an update, otherwise it's a create
  const url = medicationDispense.id
    ? `${fhirBaseUrl}/MedicationDispense/${medicationDispense.id}`
    : `${fhirBaseUrl}/MedicationDispense`;

  const method = medicationDispense.id ? 'PUT' : 'POST';

  medicationDispense.status = medicationDispenseStatus;

  // TODO for now we don't support a different prepared and handed over date, so just set the handed over to the prepared date
  medicationDispense.whenPrepared = medicationDispense.whenHandedOver;

  return openmrsFetch(url, {
    method: method,
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: medicationDispense,
  });
}

export function deleteMedicationDispense(medicationDispenseUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/MedicationDispense/${medicationDispenseUuid}`, {
    method: 'DELETE',
  });
}

export function useOrderConfig() {
  const { data, error, isValidating } = useSWR<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig`,
    openmrsFetch,
  );
  return {
    orderConfigObject: data ? data.data : null,
    error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function useProviders(providerRoles: Array<string>) {
  const rep = 'custom:(uuid,person:(display)';
  const { data } = useSWR<{ data: ProviderRequestResponse }, Error>(
    providerRoles && providerRoles.length > 0
      ? `${restBaseUrl}/provider?providerRoles=${providerRoles.join(',')}&v=${rep})`
      : `${restBaseUrl}/provider?v=${rep})`,
    openmrsFetch,
  );
  return data?.data?.results.sort((a, b) => a.person?.display.localeCompare(b.person?.display));
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
  const { data } = useSWR<{ data: ValueSet }, Error>(`${fhirBaseUrl}/ValueSet/${uuid}`, openmrsFetch);
  return data ? data.data : null;
}

// TODO: what about the issue with the repetitive reloading?
export function initiateMedicationDispenseBody(
  medicationRequest: MedicationRequest,
  session: Session,
  providers: Provider[],
  populateDispenseInformation: boolean,
): MedicationDispense {
  let medicationDispense: MedicationDispense = {
    resourceType: 'MedicationDispense',
    status: null,
    authorizingPrescription: [
      {
        reference: 'MedicationRequest/' + medicationRequest.id,
        type: 'MedicationRequest',
      },
    ],
    medicationReference: medicationRequest.medicationReference,
    medicationCodeableConcept: medicationRequest.medicationCodeableConcept,
    subject: medicationRequest.subject,
    performer: [
      {
        actor: {
          reference:
            session?.currentProvider &&
            providers &&
            providers.some((provider) => provider.uuid == session.currentProvider.uuid)
              ? `Practitioner/${session.currentProvider.uuid}`
              : '',
        },
      },
    ],
    location: {
      reference: session?.sessionLocation ? `Location/${session.sessionLocation.uuid}` : '',
    },
    whenHandedOver: dayjs().format(),
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
      dosageInstruction: [
        {
          // see https://openmrs.atlassian.net/browse/O3-3791 for an explanation for the reason for the below
          text: [
            medicationRequest.dosageInstruction[0].text,
            medicationRequest.dosageInstruction[0].additionalInstruction?.length > 0
              ? medicationRequest.dosageInstruction[0].additionalInstruction[0].text
              : null,
          ]
            .filter((str) => str != null)
            .join(' '),
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
