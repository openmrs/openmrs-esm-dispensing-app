import React from 'react';
import { render } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type MedicationDispense, MedicationDispenseStatus } from '../types';
import MedicationDispenseReview from './medication-dispense-review.component';

const mockUseConfig = jest.mocked(useConfig);

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    dispenseBehavior: {
      allowModifyingPrescription: false,
      restrictTotalQuantityDispensed: false,
    },
    valueSets: {
      substitutionType: { uuid: '123' },
      substitutionReason: { uuid: 'abc' },
    },
  });
});

describe('Medication Dispense Review Component tests', () => {
  test('component should render medication dispense review', () => {
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
        quantityDispensed={30}
      />,
    );

    // TODO test expected views and various interactions
  });
});
