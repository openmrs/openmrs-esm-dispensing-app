import useSWR from 'swr';
import { type Medication, type MedicationFormulationsResponse } from '../types';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { getConceptCodingUuid, getMedicationsByConceptEndpoint } from '../utils';

/**
 * Given a Medication Reference, fetches that Medication and returns the codeable concept associated with it
 * Note: returns null if existingMedicationCodeableConcept already defined
 *
 * @param existingMedicationCodeableConceptUuid
 * @param medicationReference
 */
export function useMedicationCodeableConcept(
  existingMedicationCodeableConceptUuid: string,
  medicationReference: string,
) {
  const { data } = useSWR<{ data: Medication }, Error>(
    existingMedicationCodeableConceptUuid || !medicationReference ? null : `${fhirBaseUrl}/${medicationReference}`,
    openmrsFetch,
  );

  return {
    medicationCodeableConceptUuid: data ? getConceptCodingUuid(data.data.code.coding) : null,
  };
}

/**
 * Given a concept uuid, returns all Medications associated with that concept
 *
 * @param medicationCodeableConcept
 */
export function useMedicationFormulations(medicationCodeableConcept: string) {
  const { data } = useSWR<{ data: MedicationFormulationsResponse }, Error>(
    medicationCodeableConcept ? getMedicationsByConceptEndpoint(medicationCodeableConcept) : null, // note that we don't start the search until we've confirmed we have a uuid to search for
    openmrsFetch,
  );

  if (data?.data?.entry) {
    return {
      medicationFormulations: data.data.entry.map((e) => e.resource),
    };
  } else {
    return {};
  }
}
