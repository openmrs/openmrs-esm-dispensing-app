import { useMedicationCodeableConcept, useMedicationFormulations } from './medication.resource';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';

jest.mocked(openmrsFetch);
jest.mock('swr');

describe('Medication Resource Tests', () => {
  test('useMedicationCodeableConcept should call useSWR with null reference if existing codeable concept uuid passed in', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: null }));
    const result = useMedicationCodeableConcept('123abc', 'Medication/123abc');
    expect(useSWR).toHaveBeenCalledWith(null, openmrsFetch);
    expect(result.medicationCodeableConceptUuid).toBeNull();
  });

  test('useMedicationCodeableConcept should call useSWR with medication reference if no existing codeable concept uuid passed in', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: { code: { coding: [{ code: 'def678' }] } } },
    }));
    const result = useMedicationCodeableConcept(null, 'Medication/123abc');
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/Medication/123abc', openmrsFetch);
    expect(result.medicationCodeableConceptUuid).toBe('def678');
  });

  test('useMedicationFormulations should call useSWR with null reference if no concept uuid provided', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: null }));
    const result = useMedicationFormulations(null);
    expect(useSWR).toHaveBeenCalledWith(null, openmrsFetch);
    expect(result.medicationFormulations).toBeUndefined(); // TODO: is this really what we want? or rather null or empty
  });

  test('useMedicationFormulations should call useSWR with with medications by concept endpoint and return formualations if concept defined', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: {
        data: {
          resourceType: 'Bundle',
          id: '2ee923c2-6e97-464e-ae0b-797b24c3b3b5',
          meta: {
            lastUpdated: '2023-02-27T17:51:19.801-05:00',
          },
          type: 'searchset',
          total: 2,
          link: [
            {
              relation: 'self',
              url: 'https://ci.pih-emr.org/openmrs/ws/fhir2/R4/Medication?code=3cd27a8a-26fe-102b-80cb-0017a47871b2',
            },
          ],
          entry: [
            {
              fullUrl: 'https://ci.pih-emr.org/openmrs/ws/fhir2/R4/Medication/e47fa273-0c52-4f0f-b57b-34001a3e9677',
              resource: {
                resourceType: 'Medication',
                id: 'e47fa273-0c52-4f0f-b57b-34001a3e9677',
                meta: {
                  lastUpdated: '2019-09-09T22:55:46.000-04:00',
                },
                text: {
                  status: 'generated',
                  div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>e47fa273-0c52-4f0f-b57b-34001a3e9677</td></tr><tr><td>Code:</td><td>Isoniazide</td></tr><tr><td>Status:</td><td>ACTIVE</td></tr></tbody></table></div>',
                },
                extension: [
                  {
                    url: 'http://fhir.openmrs.org/ext/medicine',
                    extension: [
                      {
                        url: 'http://fhir.openmrs.org/ext/medicine#drugName',
                        valueString: 'Isoniazid (H), 100mg tablet',
                      },
                    ],
                  },
                ],
                code: {
                  coding: [
                    {
                      code: '3cd27a8a-26fe-102b-80cb-0017a47871b2',
                      display: 'Isoniazide',
                    },
                    {
                      system: 'https://openconceptlab.org/orgs/CIEL/sources/CIEL',
                      code: '1679',
                      display: 'Isoniazide',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '81335000',
                      display: 'Isoniazide',
                    },
                  ],
                  text: 'Isoniazide',
                },
                status: 'active',
              },
            },
            {
              fullUrl: 'https://ci.pih-emr.org/openmrs/ws/fhir2/R4/Medication/849218ee-901c-46b3-80f9-7c808132893b',
              resource: {
                resourceType: 'Medication',
                id: '849218ee-901c-46b3-80f9-7c808132893b',
                meta: {
                  lastUpdated: '2019-09-09T22:55:46.000-04:00',
                },
                text: {
                  status: 'generated',
                  div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>849218ee-901c-46b3-80f9-7c808132893b</td></tr><tr><td>Code:</td><td>Isoniazide</td></tr><tr><td>Status:</td><td>ACTIVE</td></tr></tbody></table></div>',
                },
                extension: [
                  {
                    url: 'http://fhir.openmrs.org/ext/medicine',
                    extension: [
                      {
                        url: 'http://fhir.openmrs.org/ext/medicine#drugName',
                        valueString: 'Isoniazid (H), 300mg tablet',
                      },
                    ],
                  },
                ],
                code: {
                  coding: [
                    {
                      code: '3cd27a8a-26fe-102b-80cb-0017a47871b2',
                      display: 'Isoniazide',
                    },
                    {
                      system: 'https://openconceptlab.org/orgs/CIEL/sources/CIEL',
                      code: '1679',
                      display: 'Isoniazide',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '81335000',
                      display: 'Isoniazide',
                    },
                  ],
                  text: 'Isoniazide',
                },
                status: 'active',
              },
            },
          ],
        },
      },
    }));
    const result = useMedicationFormulations('123abc');
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/Medication?code=123abc', openmrsFetch);
    expect(result.medicationFormulations.length).toBe(2);
    expect(result.medicationFormulations[0].id).toBe('e47fa273-0c52-4f0f-b57b-34001a3e9677');
    expect(result.medicationFormulations[0].resourceType).toBe('Medication');
    expect(result.medicationFormulations[1].id).toBe('849218ee-901c-46b3-80f9-7c808132893b');
    expect(result.medicationFormulations[1].resourceType).toBe('Medication');
  });
});
