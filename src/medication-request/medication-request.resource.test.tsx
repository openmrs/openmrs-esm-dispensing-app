import dayjs from 'dayjs';
import useSWR from 'swr';
import {
  updateMedicationRequestFulfillerStatus,
  useMedicationRequest,
  usePatientAllergies,
  usePrescriptionDetails,
  usePrescriptionsTable,
} from './medication-request.resource';
import { openmrsFetch, parseDate } from '@openmrs/esm-framework';
import { MedicationRequestFulfillerStatus } from '../types';
import { JSON_MERGE_PATH_MIME_TYPE, OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS } from '../constants';

jest.mocked(openmrsFetch);
jest.mock('swr');

describe('Medication Request Resource Test', () => {
  test('usePrescriptionsTable should call active endpoint and proper date based on expiration period if status parameter is active', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: 'mockedReturnData' } }));
    usePrescriptionsTable(5, 5, 'bob', null, 'ACTIVE', 10, 10000);
    expect(useSWR).toHaveBeenCalledWith(
      `/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=5&_count=5&date=ge${dayjs()
        .startOf('day')
        .subtract(10, 'day')
        .toISOString()}&status=active&patientSearchTerm=bob`,
      openmrsFetch,
      { refreshInterval: 10000 },
    );
  });

  test('usePrescriptionsTable should call all endpoint if status parameter is not active', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: 'mockedReturnData' } }));
    usePrescriptionsTable(5, 5, 'bob', null, null, 10, 10000);
    expect(useSWR).toHaveBeenCalledWith(
      `/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=5&_count=5&patientSearchTerm=bob`,
      openmrsFetch,
      { refreshInterval: 10000 },
    );
  });

  test('usePrescriptionTable and buildPrescriptionsTableRow should properly parse search results into prescription table', () => {
    const queryResultsBundle = {
      resourceType: 'Bundle',
      id: '098e279f-bab5-4e38-82d5-83e25ec92dfc',
      meta: {
        lastUpdated: '2023-02-28T16:01:42.841-05:00',
      },
      type: 'searchset',
      total: 26,
      link: [
        {
          relation: 'self',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4/Encounter?_count=2&_getpagesoffset=0&_query=encountersWithMedicationRequests&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter',
        },
        {
          relation: 'next',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4?_getpages=05518e5c-1b97-4197-8b79-9c254a097d3a&_getpagesoffset=2&_count=2&_bundletype=searchset',
        },
      ],
      entry: [
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/7aee7123-9e50-4f72-a636-895d77a63e98',
          resource: {
            resourceType: 'Encounter',
            id: '7aee7123-9e50-4f72-a636-895d77a63e98',
            meta: {
              lastUpdated: '2023-01-24T19:02:04.000-05:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/encounter-tag',
                  code: 'encounter',
                  display: 'Encounter',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>7aee7123-9e50-4f72-a636-895d77a63e98</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Drug Order Documentation </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Period:</td><td>2023-01-24 19:02:04.0 - ?</td></tr></tbody></table></div>',
            },
            status: 'unknown',
            class: {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'AMB',
            },
            type: [
              {
                coding: [
                  {
                    system: 'http://fhir.openmrs.org/code-system/encounter-type',
                    code: '0b242b71-5b60-11eb-8f5a-0242ac110002',
                    display: 'Drug Order Documentation',
                  },
                ],
              },
            ],
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            period: {
              start: '2023-01-24T19:02:04-05:00',
            },
            location: [
              {
                location: {
                  reference: 'Location/083e75b0-5959-11e4-8ed6-0800200c9a66',
                  type: 'Location',
                  display: 'CDI Klinik Ekstèn Jeneral',
                },
              },
            ],
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2',
          resource: {
            resourceType: 'Encounter',
            id: '8be2352d-c10d-4111-ac01-0ccada4c54d2',
            meta: {
              lastUpdated: '2023-01-24T18:42:09.000-05:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/encounter-tag',
                  code: 'encounter',
                  display: 'Encounter',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8be2352d-c10d-4111-ac01-0ccada4c54d2</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Drug Order Documentation </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Period:</td><td>2023-01-24 18:42:09.0 - ?</td></tr></tbody></table></div>',
            },
            status: 'unknown',
            class: {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'AMB',
            },
            type: [
              {
                coding: [
                  {
                    system: 'http://fhir.openmrs.org/code-system/encounter-type',
                    code: '0b242b71-5b60-11eb-8f5a-0242ac110002',
                    display: 'Drug Order Documentation',
                  },
                ],
              },
            ],
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            period: {
              start: '2023-01-24T18:42:09-05:00',
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationRequest/d4f69a68-1171-4e47-8693-478df18daf40',
          resource: {
            resourceType: 'MedicationRequest',
            id: 'd4f69a68-1171-4e47-8693-478df18daf40',
            meta: {
              lastUpdated: '2023-01-24T19:02:04.000-05:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>d4f69a68-1171-4e47-8693-478df18daf40</td></tr><tr><td>Status:</td><td>COMPLETED</td></tr><tr><td>Intent:</td><td>ORDER</td></tr><tr><td>Priority:</td><td>ROUTINE</td></tr><tr><td>Medication:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Medication/c8d3444c-41a4-48d3-9ec1-811fe7b27d99">Ascorbic acid (Vitamin C), 250mg tablet</a></td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/7aee7123-9e50-4f72-a636-895d77a63e98">Encounter/7aee7123-9e50-4f72-a636-895d77a63e98</a></td></tr><tr><td>Authored On:</td><td>24/01/2023</td></tr><tr><td>Requester:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487">Goodrich, Mark (Identifier: MAADH)</a></td></tr><tr><td>Note:</td><td><div/></td></tr><tr><td>Dosage Instruction:</td><td><div>test</div></td></tr><tr><td>Dispense Requests:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Initial Fill</th><th>Dispense Interval</th><th>Validity Period</th><th>Number of Repeats Allowed</th><th>Quantity</th><th>Expected Supply Duration</th><th>Performer</th></tr><tr><td>*</td><td><div> Quantity: </div><div> Duration: </div></td><td/><td> 2023-01-24 19:02:04.0 - ? </td><td> 8 </td><td> 7.0 Application </td><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/null"/></td></tr></tbody></table></td></tr></tbody></table></div>',
            },
            status: 'completed',
            intent: 'order',
            priority: 'routine',
            medicationReference: {
              reference: 'Medication/c8d3444c-41a4-48d3-9ec1-811fe7b27d99',
              type: 'Medication',
              display: 'Ascorbic acid (Vitamin C), 250mg tablet',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            encounter: {
              reference: 'Encounter/7aee7123-9e50-4f72-a636-895d77a63e98',
              type: 'Encounter',
            },
            authoredOn: '2023-01-24T19:02:04-05:00',
            requester: {
              reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
              type: 'Practitioner',
              identifier: {
                value: 'MAADH',
              },
              display: 'Goodrich, Mark (Identifier: MAADH)',
            },
            dosageInstruction: [
              {
                text: 'test',
                timing: {
                  repeat: {
                    duration: 6,
                    durationUnit: 'd',
                  },
                  code: {
                    coding: [
                      {
                        code: '37328251-6759-4270-8a2e-8cab2c0b315b',
                        display: 'OD (once daily)',
                      },
                      {
                        system: 'http://snomed.info/sct',
                        code: '229797004',
                        display: 'OD (once daily)',
                      },
                    ],
                    text: 'OD (once daily)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '46aaaca8-1f21-410a-aac9-67bfcc1fd577',
                      display: 'Oral',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '26643006',
                      display: 'Oral',
                    },
                  ],
                  text: 'Oral',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Ampule(s)',
                      system: 'http://snomed.info/sct',
                      code: '413516001',
                    },
                  },
                ],
              },
            ],
            dispenseRequest: {
              validityPeriod: {
                start: '2023-01-24T19:02:04-05:00',
              },
              numberOfRepeatsAllowed: 8,
              quantity: {
                value: 7.0,
                unit: 'Application',
                system: 'http://snomed.info/sct',
                code: '413568008',
              },
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationDispense/d5eb4c01-01a8-44e5-8852-720c499d6260',
          resource: {
            resourceType: 'MedicationDispense',
            id: 'd5eb4c01-01a8-44e5-8852-720c499d6260',
            meta: {
              lastUpdated: '2023-02-02T14:19:57.000-05:00',
            },
            status: 'completed',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            performer: [
              {
                actor: {
                  reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
                  type: 'Practitioner',
                  identifier: {
                    value: 'MAADH',
                  },
                  display: 'Goodrich, Mark (Identifier: MAADH)',
                },
              },
            ],
            authorizingPrescription: [
              {
                reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
                type: 'MedicationRequest',
              },
            ],
            quantity: {
              value: 5.0,
              unit: 'Application',
              system: 'http://snomed.info/sct',
              code: '413568008',
            },
            whenPrepared: '2023-02-02T14:19:51-05:00',
            whenHandedOver: '2023-02-02T14:19:51-05:00',
            dosageInstruction: [
              {
                timing: {
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            substitution: {
              wasSubstituted: false,
              type: {
                coding: [
                  {
                    code: '99836b5f-12a6-48c0-8bed-8bbc0346c42d',
                    display: 'Generic composition substitution',
                  },
                ],
                text: 'Generic composition substitution',
              },
              reason: [
                {
                  coding: [
                    {
                      code: '9fb2111c-031e-47de-afaf-160c15b19f7c',
                      display: 'Formulary policy',
                    },
                  ],
                  text: 'Formulary policy',
                },
              ],
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          resource: {
            resourceType: 'MedicationRequest',
            id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
            meta: {
              lastUpdated: '2023-01-24T18:42:09.000-05:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>1c1ad91e-8653-453a-9f59-8d5c36249aff</td></tr><tr><td>Status:</td><td>ACTIVE</td></tr><tr><td>Intent:</td><td>ORDER</td></tr><tr><td>Priority:</td><td>ROUTINE</td></tr><tr><td>Medication:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Medication/60520315-2c98-425a-b404-d282f8c841ec">Paracetamol, 100mg rectal suppository</a></td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2">Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2</a></td></tr><tr><td>Authored On:</td><td>24/01/2023</td></tr><tr><td>Requester:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487">Goodrich, Mark (Identifier: MAADH)</a></td></tr><tr><td>Note:</td><td><div/></td></tr><tr><td>Dosage Instruction:</td><td><div/></td></tr><tr><td>Dispense Requests:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Initial Fill</th><th>Dispense Interval</th><th>Validity Period</th><th>Number of Repeats Allowed</th><th>Quantity</th><th>Expected Supply Duration</th><th>Performer</th></tr><tr><td>*</td><td><div> Quantity: </div><div> Duration: </div></td><td/><td> 2023-01-24 18:42:09.0 - ? </td><td> 5 </td><td> 5.0 Application </td><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/null"/></td></tr></tbody></table></td></tr></tbody></table></div>',
            },
            status: 'active',
            intent: 'order',
            priority: 'routine',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            encounter: {
              reference: 'Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2',
              type: 'Encounter',
            },
            authoredOn: '2023-01-24T18:42:09-05:00',
            requester: {
              reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
              type: 'Practitioner',
              identifier: {
                value: 'MAADH',
              },
              display: 'Goodrich, Mark (Identifier: MAADH)',
            },
            dosageInstruction: [
              {
                timing: {
                  repeat: {
                    duration: 5,
                    durationUnit: 'wk',
                  },
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            dispenseRequest: {
              validityPeriod: {
                start: '2023-01-24T18:42:09-05:00',
              },
              numberOfRepeatsAllowed: 5,
              quantity: {
                value: 5.0,
                unit: 'Application',
                system: 'http://snomed.info/sct',
                code: '413568008',
              },
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationDispense/8841f349-0a86-43d2-80f5-020b70553a99',
          resource: {
            resourceType: 'MedicationDispense',
            id: '8841f349-0a86-43d2-80f5-020b70553a99',
            meta: {
              lastUpdated: '2023-02-02T14:09:35.000-05:00',
            },
            status: 'completed',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            performer: [
              {
                actor: {
                  reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
                  type: 'Practitioner',
                  identifier: {
                    value: 'MAADH',
                  },
                  display: 'Goodrich, Mark (Identifier: MAADH)',
                },
              },
            ],
            authorizingPrescription: [
              {
                reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
                type: 'MedicationRequest',
              },
            ],
            quantity: {
              value: 5.0,
              unit: 'Application',
              system: 'http://snomed.info/sct',
              code: '413568008',
            },
            whenPrepared: '2023-02-02T14:04:11-05:00',
            whenHandedOver: '2023-02-02T14:04:11-05:00',
            dosageInstruction: [
              {
                timing: {
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            substitution: {
              wasSubstituted: false,
              type: {
                coding: [
                  {
                    code: '03795bf1-44be-4589-9873-0ea312a082fb',
                    display: 'Formulary substitution',
                  },
                ],
                text: 'Formulary substitution',
              },
              reason: [
                {
                  coding: [
                    {
                      code: '163057AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      display: 'Continue treatment',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '266714009',
                      display: 'Continue treatment',
                    },
                  ],
                  text: 'Continue treatment',
                },
              ],
            },
          },
        },
      ],
    };

    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: queryResultsBundle } }));
    const { prescriptionsTableRows, totalOrders } = usePrescriptionsTable(2, 0, 'bob', 'ACTIVE', null, 90, 10000);
    expect(totalOrders).toBe(26);
    expect(prescriptionsTableRows.length).toBe(2);
    expect(prescriptionsTableRows[0].id).toBe('7aee7123-9e50-4f72-a636-895d77a63e98');
    expect(prescriptionsTableRows[0].created).toBe('2023-01-24T19:02:04-05:00');
    expect(prescriptionsTableRows[0].drugs).toBe('Ascorbic acid (Vitamin C), 250mg tablet');
    expect(prescriptionsTableRows[0].lastDispenser).toBeUndefined();
    expect(prescriptionsTableRows[0].patient.name).toBe('Dylan, Bob (ZL EMR ID: Y2CK2G)');
    expect(prescriptionsTableRows[0].patient.uuid).toBe('558494fe-5850-4b34-a3bf-06550334ba4a');
    expect(prescriptionsTableRows[0].prescriber).toBe('Goodrich, Mark (Identifier: MAADH)');
    expect(prescriptionsTableRows[0].status).toBe('completed');
    expect(prescriptionsTableRows[0].location).toBe('CDI Klinik Ekstèn Jeneral');
    expect(prescriptionsTableRows[1].id).toBe('8be2352d-c10d-4111-ac01-0ccada4c54d2');
    expect(prescriptionsTableRows[1].created).toBe('2023-01-24T18:42:09-05:00');
    expect(prescriptionsTableRows[1].drugs).toBe('Paracetamol, 100mg rectal suppository');
    expect(prescriptionsTableRows[1].lastDispenser).toBe('Goodrich, Mark (Identifier: MAADH)');
    expect(prescriptionsTableRows[1].patient.name).toBe('Dylan, Bob (ZL EMR ID: Y2CK2G)');
    expect(prescriptionsTableRows[1].patient.uuid).toBe('558494fe-5850-4b34-a3bf-06550334ba4a');
    expect(prescriptionsTableRows[1].prescriber).toBe('Goodrich, Mark (Identifier: MAADH)');
    expect(prescriptionsTableRows[1].status).toBe('expired');
    expect(prescriptionsTableRows[1].location).toBeNull();
  });

  test('usePrescriptionsDetails should call endpoint with encounter uuid', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: [] } }));
    usePrescriptionDetails('123abc', 10000);
    expect(useSWR).toHaveBeenCalledWith(
      '/ws/fhir2/R4/MedicationRequest?encounter=123abc&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter',
      openmrsFetch,
      { refreshInterval: 10000 },
    );
  });

  test('usePrescriptionDetails should properly parse medication request response', () => {
    const queryRequestBundle = {
      resourceType: 'Bundle',
      id: '1aafa3c6-83c2-4485-baaa-f700056e43c9',
      meta: {
        lastUpdated: '2023-03-01T09:47:17.436-05:00',
      },
      type: 'searchset',
      total: 1,
      link: [
        {
          relation: 'self',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationRequest?_include=MedicationRequest%3Aencounter&_revinclude=MedicationDispense%3Aprescription&encounter=8be2352d-c10d-4111-ac01-0ccada4c54d2',
        },
      ],
      entry: [
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          resource: {
            resourceType: 'MedicationRequest',
            id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
            meta: {
              lastUpdated: '2023-01-24T18:42:09.000-05:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>1c1ad91e-8653-453a-9f59-8d5c36249aff</td></tr><tr><td>Status:</td><td>STOPPED</td></tr><tr><td>Intent:</td><td>ORDER</td></tr><tr><td>Priority:</td><td>ROUTINE</td></tr><tr><td>Medication:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Medication/60520315-2c98-425a-b404-d282f8c841ec">Paracetamol, 100mg rectal suppository</a></td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Encounter:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2">Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2</a></td></tr><tr><td>Authored On:</td><td>24/01/2023</td></tr><tr><td>Requester:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487">Goodrich, Mark (Identifier: MAADH)</a></td></tr><tr><td>Note:</td><td><div/></td></tr><tr><td>Dosage Instruction:</td><td><div/></td></tr><tr><td>Dispense Requests:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Initial Fill</th><th>Dispense Interval</th><th>Validity Period</th><th>Number of Repeats Allowed</th><th>Quantity</th><th>Expected Supply Duration</th><th>Performer</th></tr><tr><td>*</td><td><div> Quantity: </div><div> Duration: </div></td><td/><td> 2023-01-24 18:42:09.0 - ? </td><td> 5 </td><td> 5.0 Application </td><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/null"/></td></tr></tbody></table></td></tr></tbody></table></div>',
            },
            status: 'stopped',
            intent: 'order',
            priority: 'routine',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            encounter: {
              reference: 'Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2',
              type: 'Encounter',
            },
            authoredOn: '2023-01-24T18:42:09-05:00',
            requester: {
              reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
              type: 'Practitioner',
              identifier: {
                value: 'MAADH',
              },
              display: 'Goodrich, Mark (Identifier: MAADH)',
            },
            dosageInstruction: [
              {
                timing: {
                  repeat: {
                    duration: 5,
                    durationUnit: 'wk',
                  },
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            dispenseRequest: {
              validityPeriod: {
                start: '2023-01-24T18:42:09-05:00',
              },
              numberOfRepeatsAllowed: 5,
              quantity: {
                value: 5.0,
                unit: 'Application',
                system: 'http://snomed.info/sct',
                code: '413568008',
              },
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationDispense/d5eb4c01-01a8-44e5-8852-720c499d6260',
          resource: {
            resourceType: 'MedicationDispense',
            id: 'd5eb4c01-01a8-44e5-8852-720c499d6260',
            meta: {
              lastUpdated: '2023-02-02T14:19:57.000-05:00',
            },
            status: 'completed',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            performer: [
              {
                actor: {
                  reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
                  type: 'Practitioner',
                  identifier: {
                    value: 'MAADH',
                  },
                  display: 'Goodrich, Mark (Identifier: MAADH)',
                },
              },
            ],
            authorizingPrescription: [
              {
                reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
                type: 'MedicationRequest',
              },
            ],
            quantity: {
              value: 5.0,
              unit: 'Application',
              system: 'http://snomed.info/sct',
              code: '413568008',
            },
            whenPrepared: '2023-02-02T14:19:51-05:00',
            whenHandedOver: '2023-02-01T14:19:51-05:00',
            dosageInstruction: [
              {
                timing: {
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            substitution: {
              wasSubstituted: false,
              type: {
                coding: [
                  {
                    code: '99836b5f-12a6-48c0-8bed-8bbc0346c42d',
                    display: 'Generic composition substitution',
                  },
                ],
                text: 'Generic composition substitution',
              },
              reason: [
                {
                  coding: [
                    {
                      code: '9fb2111c-031e-47de-afaf-160c15b19f7c',
                      display: 'Formulary policy',
                    },
                  ],
                  text: 'Formulary policy',
                },
              ],
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/8be2352d-c10d-4111-ac01-0ccada4c54d2',
          resource: {
            resourceType: 'Encounter',
            id: '8be2352d-c10d-4111-ac01-0ccada4c54d2',
            meta: {
              lastUpdated: '2023-01-24T18:42:09.000-05:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/encounter-tag',
                  code: 'encounter',
                  display: 'Encounter',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8be2352d-c10d-4111-ac01-0ccada4c54d2</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Drug Order Documentation </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Period:</td><td>2023-01-24 18:42:09.0 - ?</td></tr></tbody></table></div>',
            },
            status: 'unknown',
            class: {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'AMB',
            },
            type: [
              {
                coding: [
                  {
                    system: 'http://fhir.openmrs.org/code-system/encounter-type',
                    code: '0b242b71-5b60-11eb-8f5a-0242ac110002',
                    display: 'Drug Order Documentation',
                  },
                ],
              },
            ],
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            period: {
              start: '2023-01-24T18:42:09-05:00',
            },
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/MedicationDispense/8841f349-0a86-43d2-80f5-020b70553a99',
          resource: {
            resourceType: 'MedicationDispense',
            id: '8841f349-0a86-43d2-80f5-020b70553a99',
            meta: {
              lastUpdated: '2023-02-02T14:09:35.000-05:00',
            },
            status: 'completed',
            medicationReference: {
              reference: 'Medication/60520315-2c98-425a-b404-d282f8c841ec',
              type: 'Medication',
              display: 'Paracetamol, 100mg rectal suppository',
            },
            subject: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            performer: [
              {
                actor: {
                  reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
                  type: 'Practitioner',
                  identifier: {
                    value: 'MAADH',
                  },
                  display: 'Goodrich, Mark (Identifier: MAADH)',
                },
              },
            ],
            authorizingPrescription: [
              {
                reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
                type: 'MedicationRequest',
              },
            ],
            quantity: {
              value: 5.0,
              unit: 'Application',
              system: 'http://snomed.info/sct',
              code: '413568008',
            },
            whenPrepared: '2023-02-02T14:04:11-05:00',
            whenHandedOver: '2023-02-02T14:04:11-05:00',
            dosageInstruction: [
              {
                timing: {
                  code: {
                    coding: [
                      {
                        code: '023bee9c-2dbb-483c-8401-46f0ccf6b333',
                        display: 'ON (night)',
                      },
                    ],
                    text: 'ON (night)',
                  },
                },
                asNeededBoolean: false,
                route: {
                  coding: [
                    {
                      code: '304da4df-f376-4a3f-ba70-c9fbc8fe8fa6',
                      display: 'Intravenous',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '47625008',
                      display: 'Intravenous',
                    },
                  ],
                  text: 'Intravenous',
                },
                doseAndRate: [
                  {
                    doseQuantity: {
                      value: 5.0,
                      unit: 'Application',
                      system: 'http://snomed.info/sct',
                      code: '413568008',
                    },
                  },
                ],
              },
            ],
            substitution: {
              wasSubstituted: false,
              type: {
                coding: [
                  {
                    code: '03795bf1-44be-4589-9873-0ea312a082fb',
                    display: 'Formulary substitution',
                  },
                ],
                text: 'Formulary substitution',
              },
              reason: [
                {
                  coding: [
                    {
                      code: '163057AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      display: 'Continue treatment',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '266714009',
                      display: 'Continue treatment',
                    },
                  ],
                  text: 'Continue treatment',
                },
              ],
            },
          },
        },
      ],
    };
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: queryRequestBundle } }));
    const { medicationRequestBundles, prescriptionDate } = usePrescriptionDetails(
      '1aafa3c6-83c2-4485-baaa-f700056e43c9',
      10000,
    );
    expect(medicationRequestBundles.length).toBe(1);
    expect(medicationRequestBundles[0].request.id).toBe('1c1ad91e-8653-453a-9f59-8d5c36249aff');
    expect(medicationRequestBundles[0].dispenses.length).toBe(2);
    expect(medicationRequestBundles[0].dispenses[0].id).toBe('8841f349-0a86-43d2-80f5-020b70553a99');
    expect(medicationRequestBundles[0].dispenses[1].id).toBe('d5eb4c01-01a8-44e5-8852-720c499d6260');
    expect(prescriptionDate.toISOString()).toBe(parseDate('2023-01-24T18:42:09-05:00').toISOString());
  });

  test('usePatientAllergies should call endpoint with patient uuid', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: [] } }));
    usePatientAllergies('123abc', 10000);
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/AllergyIntolerance?patient=123abc', openmrsFetch, {
      refreshInterval: 10000,
    });
  });

  test('usePatientAllergies should parse allergy response', () => {
    const queryRequestBundle = {
      resourceType: 'Bundle',
      id: '9fef5048-2d50-4c0c-8e61-4c705b7260b5',
      meta: {
        lastUpdated: '2023-03-01T10:02:05.265-05:00',
      },
      type: 'searchset',
      total: 2,
      link: [
        {
          relation: 'self',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4/AllergyIntolerance?patient=558494fe-5850-4b34-a3bf-06550334ba4a',
        },
      ],
      entry: [
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/AllergyIntolerance/c8baf2e4-05d1-4797-a0c0-3c55cf32eda7',
          resource: {
            resourceType: 'AllergyIntolerance',
            id: 'c8baf2e4-05d1-4797-a0c0-3c55cf32eda7',
            meta: {
              lastUpdated: '2023-03-01T10:01:52.000-05:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>c8baf2e4-05d1-4797-a0c0-3c55cf32eda7</td></tr><tr><td>Clinical Status:</td><td>Active</td></tr><tr><td>Verification Status:</td><td>Confirmed</td></tr><tr><td>Type:</td><td>ALLERGY</td></tr><tr><td>Category:</td><td> Enumeration[medication] </td></tr><tr><td>Criticality:</td><td>UNABLETOASSESS</td></tr><tr><td>Code:</td><td> Cephalosporins </td></tr><tr><td>Patient:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Recorded Date:</td><td>01/03/2023</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/92d873a8-c787-4465-aa4b-5b6197902587">Goodrich, Mark</a></td></tr><tr><td>Note:</td><td><div>tets</div></td></tr><tr><td>Reaction:</td><td/></tr><tr><td>Substance:</td><td> Cephalosporins </td></tr><tr><td>Manifestation:</td><td><div> Anemia </div></td></tr><tr><td>Severity:</td><td>MODERATE</td></tr></tbody></table></div>',
            },
            clinicalStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  code: 'active',
                  display: 'Active',
                },
              ],
              text: 'Active',
            },
            verificationStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
                  code: 'confirmed',
                  display: 'Confirmed',
                },
              ],
              text: 'Confirmed',
            },
            type: 'allergy',
            category: ['medication'],
            criticality: 'unable-to-assess',
            code: {
              coding: [
                {
                  code: '162301AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Cephalosporins',
                },
                {
                  system: 'http://snomed.info/sct',
                  code: '51779009',
                  display: 'Cephalosporins',
                },
              ],
            },
            patient: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            recordedDate: '2023-03-01T10:01:52-05:00',
            recorder: {
              reference: 'Practitioner/92d873a8-c787-4465-aa4b-5b6197902587',
              type: 'Practitioner',
              display: 'Goodrich, Mark',
            },
            note: [
              {
                text: 'tets',
              },
            ],
            reaction: [
              {
                substance: {
                  coding: [
                    {
                      code: '162301AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      display: 'Cephalosporins',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '51779009',
                      display: 'Cephalosporins',
                    },
                  ],
                },
                manifestation: [
                  {
                    coding: [
                      {
                        code: '3ccc4764-26fe-102b-80cb-0017a47871b2',
                        display: 'Anemia',
                      },
                      {
                        system: 'http://snomed.info/sct',
                        code: '271737000',
                        display: 'Anemia',
                      },
                    ],
                  },
                ],
                severity: 'moderate',
              },
            ],
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/AllergyIntolerance/b65c893f-4cd3-481e-aebf-4e2d03cff28b',
          resource: {
            resourceType: 'AllergyIntolerance',
            id: 'b65c893f-4cd3-481e-aebf-4e2d03cff28b',
            meta: {
              lastUpdated: '2023-03-01T10:01:59.000-05:00',
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>b65c893f-4cd3-481e-aebf-4e2d03cff28b</td></tr><tr><td>Clinical Status:</td><td>Active</td></tr><tr><td>Verification Status:</td><td>Confirmed</td></tr><tr><td>Type:</td><td>ALLERGY</td></tr><tr><td>Category:</td><td> Enumeration[food] </td></tr><tr><td>Code:</td><td> Dairy food </td></tr><tr><td>Patient:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/558494fe-5850-4b34-a3bf-06550334ba4a">Dylan, Bob (ZL EMR ID: Y2CK2G)</a></td></tr><tr><td>Recorded Date:</td><td>01/03/2023</td></tr><tr><td>Recorder:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/92d873a8-c787-4465-aa4b-5b6197902587">Goodrich, Mark</a></td></tr><tr><td>Note:</td><td><div/></td></tr><tr><td>Reaction:</td><td/></tr><tr><td>Substance:</td><td> Dairy food </td></tr><tr><td>Manifestation:</td><td><div> Anaphylaxis </div></td></tr></tbody></table></div>',
            },
            clinicalStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                  code: 'active',
                  display: 'Active',
                },
              ],
              text: 'Active',
            },
            verificationStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
                  code: 'confirmed',
                  display: 'Confirmed',
                },
              ],
              text: 'Confirmed',
            },
            type: 'allergy',
            category: ['food'],
            code: {
              coding: [
                {
                  code: '162545AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Dairy food',
                },
                {
                  system: 'http://snomed.info/sct',
                  code: '226760005',
                  display: 'Dairy food',
                },
              ],
            },
            patient: {
              reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
              type: 'Patient',
              display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
            },
            recordedDate: '2023-03-01T10:01:59-05:00',
            recorder: {
              reference: 'Practitioner/92d873a8-c787-4465-aa4b-5b6197902587',
              type: 'Practitioner',
              display: 'Goodrich, Mark',
            },
            reaction: [
              {
                substance: {
                  coding: [
                    {
                      code: '162545AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                      display: 'Dairy food',
                    },
                    {
                      system: 'http://snomed.info/sct',
                      code: '226760005',
                      display: 'Dairy food',
                    },
                  ],
                },
                manifestation: [
                  {
                    coding: [
                      {
                        code: '3cd68008-26fe-102b-80cb-0017a47871b2',
                        display: 'Anaphylaxis',
                      },
                      {
                        system: 'http://snomed.info/sct',
                        code: '39579001',
                        display: 'Anaphylaxis',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: queryRequestBundle } }));
    const { totalAllergies } = usePatientAllergies('558494fe-5850-4b34-a3bf-06550334ba4a', 10000);
    expect(totalAllergies).toBe(2);
    // TODO allergy parsing doesn't seem to be working?
  });

  test('useMedicationRequest should prepend MedicationRequest and call endpoint if uuid passed in', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: [] } }));
    useMedicationRequest('123abc', 10000);
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/MedicationRequest/123abc', openmrsFetch, {
      refreshInterval: 10000,
    });
  });

  test('useMedicationRequest should prepend MedicationRequest and call endpoint if uuid passed in', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: [] } }));
    useMedicationRequest('123abc', 10000);
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/MedicationRequest/123abc', openmrsFetch, {
      refreshInterval: 10000,
    });
  });

  test('useMedicationRequest should not prepend MedicationRequest and call endpoint if full reference passed in', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: [] } }));
    useMedicationRequest('MedicationRequest/123abc', 10000);
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/MedicationRequest/123abc', openmrsFetch, {
      refreshInterval: 10000,
    });
  });

  test('updateMedicationRequestFulfillerStatus should call medication request FHIR endpoint with appropriate data ', () => {
    const medicationRequestUuid = '123abc';

    updateMedicationRequestFulfillerStatus(medicationRequestUuid, MedicationRequestFulfillerStatus.completed);
    expect(openmrsFetch).toHaveBeenCalledWith(`/ws/fhir2/R4/MedicationRequest/${medicationRequestUuid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': JSON_MERGE_PATH_MIME_TYPE,
      },
      body: {
        extension: [
          {
            url: OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      },
    });
  });
});
