import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  getDefaultsFromConfigSchema,
  OpenmrsDatePicker,
  useConfig,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import { configSchema, type PharmacyConfig } from '../config-schema';
import { type MedicationDispense, type Medication, MedicationDispenseStatus } from '../types';
import { useMedicationFormulations } from '../medication/medication.resource';
import MedicationDispenseReview from './medication-dispense-review.component';

const mockUseConfig = jest.mocked(useConfig<PharmacyConfig>);
const mockOpenmrsDatePicker = jest.mocked(OpenmrsDatePicker);
const mockUseSession = jest.mocked(useSession);
const mockUseMedicationFormulations = jest.mocked(useMedicationFormulations);
const mockUserHasAccess = jest.mocked(userHasAccess);

const defaultPharmacyConfig = {
  ...getDefaultsFromConfigSchema(configSchema),
};

const mockSessionData = {
  authenticated: true,
  locale: 'en_GB',
  currentProvider: {
    uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c4057z',
    display: 'Test User',
    person: {
      uuid: 'ddd5fa89-48a6-432e-abb8-0d11b4be7e4f',
      display: 'Test User',
    },
    identifier: 'UNKNOWN',
    attributes: [],
  },
  sessionLocation: {
    uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
    display: 'Inpatient Ward',
    name: 'Inpatient Ward',
    description: null,
    address1: null,
    address2: null,
    cityVillage: null,
    stateProvince: null,
    country: null,
    postalCode: null,
    latitude: null,
    longitude: null,
    countyDistrict: null,
    address3: null,
    address4: null,
    address5: null,
    address6: null,
    tags: [
      {
        uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
        display: 'Transfer Location',
      },
      {
        uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
        display: 'Login Location',
      },
      {
        uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
        display: 'Admission Location',
      },
    ],
    parentLocation: {
      uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      display: 'Amani Hospital',
    },
    childLocations: [],
    retired: false,
    attributes: [],
    address7: null,
    address8: null,
    address9: null,
    address10: null,
    address11: null,
    address12: null,
    address13: null,
    address14: null,
    address15: null,
    links: [],
  },
  user: {
    uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
    display: 'admin',
    username: '',
    systemId: 'admin',
    userProperties: {
      loginAttempts: '0',
    },
    person: {
      uuid: '0775e6b7-f439-40e5-87a3-2bd11f3b9ee5',
      display: 'Test User',
    },
    privileges: [
      {
        uuid: '62431c71-5244-11ea-a771-0242ac160002',
        display: 'Manage Appointment Services',
        links: [],
      },
      {
        uuid: '6206682c-5244-11ea-a771-0242ac160002',
        display: 'Manage Appointments',
        links: [],
      },
      {
        uuid: '6280ff58-5244-11ea-a771-0242ac160002',
        display: 'Manage Appointment Specialities',
        links: [],
      },
    ],
    roles: [
      {
        uuid: '8d94f852-c2cc-11de-8d13-0010c6dffd0f',
        display: 'System Developer',
        links: [],
      },
      {
        uuid: '62c195c5-5244-11ea-a771-0242ac160002',
        display: 'Bahmni Role',
        links: [],
      },
      {
        uuid: '8d94f280-c2cc-11de-8d13-0010c6dffd0f',
        display: 'Provider',
        links: [],
      },
    ],
    retired: false,
    locale: 'en_GB',
    allowedLocales: ['en_GB'],
  },
  sessionId: 'D4F7D4D4-6A6D-4D4D-8D4D-4D4D4D4D4D4D',
};

const mockMedicationFormulations = [
  {
    resourceType: 'Medication',
    id: '09e58895-e7f0-4649-b7c0-e665c5c08e93',
    meta: {
      versionId: '1732041351000',
      lastUpdated: '2024-11-19T18:35:51.000+00:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode',
        },
      ],
    },
    extension: [
      {
        url: 'http://fhir.openmrs.org/ext/medicine',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicine#drugName',
            valueString: 'Aspirin 81mg',
          },
          {
            url: 'http://fhir.openmrs.org/ext/medicine#strength',
            valueString: '81mg',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          code: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Aspirin',
        },
      ],
      text: 'Aspirin',
    },
    status: 'active',
    form: {
      coding: [
        {
          code: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Tablet',
        },
        {
          system: 'https://cielterminology.org',
          code: '1513',
        },
        {
          system: 'http://snomed.info/sct/',
          code: '385055001',
        },
      ],
      text: 'Tablet',
    },
  },
  {
    resourceType: 'Medication',
    id: '38087db3-7395-431f-88d5-bb25e06e33f1',
    meta: {
      versionId: '1732041351000',
      lastUpdated: '2024-11-19T18:35:51.000+00:00',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode',
        },
      ],
    },
    extension: [
      {
        url: 'http://fhir.openmrs.org/ext/medicine',
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicine#drugName',
            valueString: 'Aspirin 325mg',
          },
          {
            url: 'http://fhir.openmrs.org/ext/medicine#strength',
            valueString: '325mg',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          code: '71617AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Aspirin',
        },
      ],
      text: 'Aspirin',
    },
    status: 'active',
    form: {
      coding: [
        {
          code: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Tablet',
        },
        {
          system: 'https://cielterminology.org',
          code: '1513',
        },
        {
          system: 'http://snomed.info/sct/',
          code: '385055001',
        },
      ],
      text: 'Tablet',
    },
  },
];

jest.mock('../medication/medication.resource', () => {
  return {
    ...jest.requireActual('../medication/medication.resource'),
    useMedicationFormulations: jest.fn(),
  };
});

jest.mock('../utils', () => {
  return {
    ...jest.requireActual('../utils'),
    getOpenMRSMedicineDrugName: jest.fn().mockImplementation((medication) => {
      if (!medication || !medication.extension) {
        return null;
      }

      return medication.extension?.find((ext) => ext.url === 'http://fhir.openmrs.org/ext/medicine#drugName')
        ?.valueString;
    }),
  };
});

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    ...defaultPharmacyConfig,
    dispenseBehavior: {
      allowModifyingPrescription: false,
      restrictTotalQuantityDispensed: false,
    },
    valueSets: {
      substitutionType: { uuid: '123' },
      substitutionReason: { uuid: 'abc' },
    },
  } as PharmacyConfig);

  mockOpenmrsDatePicker.mockReturnValue(<div />);
  mockUseSession.mockReturnValue(mockSessionData);
  mockUserHasAccess.mockReturnValue(true);
  mockUseMedicationFormulations.mockReturnValue({
    medicationFormulations: mockMedicationFormulations as unknown as Medication[],
  });
});

describe('MedicationDispenseReview', () => {
  const baseMedicationDispense: MedicationDispense = {
    resourceType: 'MedicationDispense',
    id: 'ff2fa24c-b0d4-457c-bbdf-7d6512b8b746',
    type: {
      coding: [
        {
          code: '123',
        },
      ],
    },
    meta: {
      lastUpdated: '2023-01-10T10:52:36.000-05:00',
    },
    status: MedicationDispenseStatus.completed,
    medicationReference: {
      reference: 'Medication/78f96684-dfbe-11e9-8a34-2a2ae2dbcce4',
      type: 'Medication',
      display: 'Lamivudine (3TC), Oral solution, 10mg/mL, 240mL bottle',
    },
    subject: {
      reference: 'Patient/b36dbb26-8309-4d51-80ed-07bbb63ab928',
      type: 'Patient',
      display: 'Test, Fiona (ZL EMR ID: Y480K4)',
    },
    performer: [
      {
        actor: {
          reference: 'Practitioner/6558dfef-bfe1-488e-b048-ed286aded924',
          type: 'Practitioner',
          identifier: {
            value: 'LADAL',
          },
          display: 'Dylan, Bob (Identifier: LADAL)',
        },
      },
    ],
    location: {
      reference: 'Location/47521fa1-ac7f-4fdb-b167-a86fe223a3d9',
      type: 'Location',
      display: 'Klinik MNT',
    },
    authorizingPrescription: [
      {
        reference: 'MedicationRequest/9e416e5f-a435-433c-99d3-8b2fd1e8a421',
        type: 'MedicationRequest',
      },
    ],
    quantity: {
      value: 30.0,
      unit: 'Tablet',
      system: 'http://snomed.info/sct',
      code: '385055001',
    },
    whenPrepared: '2023-01-10T10:52:22-05:00',
    whenHandedOver: '2023-01-10T10:52:22-05:00',
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
              code: '46aaaca8-1f21-410a-aac9-67bfcc1fd577',
              display: 'Oral',
            },
            {
              system: 'https://openconceptlab.org/orgs/CIEL/sources/CIEL',
              code: '160240',
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
              value: 1.0,
              unit: 'Tablet',
              system: 'http://snomed.info/sct',
              code: '385055001',
            },
          },
        ],
      },
    ],
    substitution: {
      wasSubstituted: false,
    },
  };

  test('renders the medication dispense review UI', () => {
    const medicationDispense: MedicationDispense = {
      resourceType: 'MedicationDispense',
      id: 'ff2fa24c-b0d4-457c-bbdf-7d6512b8b746',
      type: {
        coding: [
          {
            code: '123',
          },
        ],
      },
      meta: {
        lastUpdated: '2023-01-10T10:52:36.000-05:00',
      },
      status: MedicationDispenseStatus.completed,
      medicationReference: {
        reference: 'Medication/78f96684-dfbe-11e9-8a34-2a2ae2dbcce4',
        type: 'Medication',
        display: 'Lamivudine (3TC), Oral solution, 10mg/mL, 240mL bottle',
      },
      subject: {
        reference: 'Patient/b36dbb26-8309-4d51-80ed-07bbb63ab928',
        type: 'Patient',
        display: 'Test, Fiona (ZL EMR ID: Y480K4)',
      },
      performer: [
        {
          actor: {
            reference: 'Practitioner/6558dfef-bfe1-488e-b048-ed286aded924',
            type: 'Practitioner',
            identifier: {
              value: 'LADAL',
            },
            display: 'Dylan, Bob (Identifier: LADAL)',
          },
        },
      ],
      location: {
        reference: 'Location/47521fa1-ac7f-4fdb-b167-a86fe223a3d9',
        type: 'Location',
        display: 'Klinik MNT',
      },
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/9e416e5f-a435-433c-99d3-8b2fd1e8a421',
          type: 'MedicationRequest',
        },
      ],
      quantity: {
        value: 30.0,
        unit: 'Tablet',
        system: 'http://snomed.info/sct',
        code: '385055001',
      },
      whenPrepared: '2023-01-10T10:52:22-05:00',
      whenHandedOver: '2023-01-10T10:52:22-05:00',
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
                code: '46aaaca8-1f21-410a-aac9-67bfcc1fd577',
                display: 'Oral',
              },
              {
                system: 'https://openconceptlab.org/orgs/CIEL/sources/CIEL',
                code: '160240',
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
                value: 1.0,
                unit: 'Tablet',
                system: 'http://snomed.info/sct',
                code: '385055001',
              },
            },
          ],
        },
      ],
      substitution: {
        wasSubstituted: false,
      },
    };

    const mockUpdate: Function = jest.fn();

    render(
      <MedicationDispenseReview
        medicationDispense={medicationDispense}
        updateMedicationDispense={mockUpdate}
        quantityRemaining={30}
      />,
    );

    expect(screen.getByRole('spinbutton', { name: /quantity/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /dose/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /dispensing unit/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /dose unit/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /route/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /frequency/i })).toBeInTheDocument();
  });

  test('enforces quantity restrictions when configured', () => {
    mockUseConfig.mockReturnValue({
      ...defaultPharmacyConfig,
      dispenseBehavior: {
        allowModifyingPrescription: true,
        restrictTotalQuantityDispensed: true,
      },
    } as PharmacyConfig);

    render(
      <MedicationDispenseReview
        medicationDispense={baseMedicationDispense}
        updateMedicationDispense={jest.fn()}
        quantityRemaining={10}
      />,
    );

    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    expect(quantityInput).toHaveAttribute('max', '10');
  });

  test('handles medication formulation editing', () => {
    const mockUpdate = jest.fn();

    mockUseConfig.mockReturnValue({
      ...defaultPharmacyConfig,
      dispenseBehavior: {
        allowModifyingPrescription: true,
      },
    } as PharmacyConfig);

    render(
      <MedicationDispenseReview
        medicationDispense={baseMedicationDispense}
        updateMedicationDispense={mockUpdate}
        quantityRemaining={30}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });
});
