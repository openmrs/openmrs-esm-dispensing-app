import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import { type MedicationDispense, type MedicationRequestBundle, MedicationDispenseStatus } from '../types';
import DispenseForm from './dispense-form.workspace';

const mockUseConfig = jest.mocked(useConfig);
const mockUsePatient = jest.mocked(usePatient);
const mockCloseWorkspace = jest.fn();
const mockLaunchChildWorkspace = jest.fn();

// Mock workspace props required by Workspace2DefinitionProps
const mockWorkspaceProps = {
  launchChildWorkspace: mockLaunchChildWorkspace,
  windowProps: {},
  groupProps: {},
  workspaceName: 'dispense-form',
  windowName: 'dispense-form-window',
  isRootWorkspace: true,
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
};

// Mock the child components
jest.mock('./medication-dispense-review.component', () => ({
  __esModule: true,
  default: () => <div>Medication Dispense Review</div>,
}));

jest.mock('./stock-dispense/stock-dispense.component', () => ({
  __esModule: true,
  default: () => <div>Stock Dispense</div>,
}));

const mockPatient = {
  uuid: 'patient-uuid',
  display: 'Test Patient',
  identifiers: [],
  person: {
    age: 30,
    attributes: [],
    birthDate: '1990-01-01',
    gender: 'M',
    display: 'Test Patient',
    preferredAddress: {},
    uuid: 'patient-uuid',
  },
};

const createMockMedicationDispense = (): MedicationDispense => ({
  resourceType: 'MedicationDispense',
  status: MedicationDispenseStatus.completed,
  medicationReference: {
    reference: 'Medication/med-uuid',
    display: 'Test Medication',
  },
  subject: {
    reference: 'Patient/patient-uuid',
    display: 'Test Patient',
  },
  performer: [
    {
      actor: {
        reference: 'Practitioner/prac-uuid',
        display: 'Test Practitioner',
      },
    },
  ],
  location: {
    reference: 'Location/loc-uuid',
    display: 'Test Location',
  },
  quantity: {
    value: 30,
    code: '385055001',
  },
  dosageInstruction: [
    {
      timing: {
        code: {
          coding: [
            {
              code: 'timing-code',
              display: 'Once daily',
            },
          ],
        },
      },
      asNeededBoolean: false,
      route: {
        coding: [
          {
            code: 'route-code',
            display: 'Oral',
          },
        ],
      },
      doseAndRate: [
        {
          doseQuantity: {
            value: 1,
            code: '385055001',
          },
        },
      ],
    },
  ],
  substitution: {
    wasSubstituted: false,
  },
});

const createMockMedicationRequestBundle = (numberOfRepeatsAllowed: number | null): MedicationRequestBundle => ({
  request: {
    resourceType: 'MedicationRequest',
    id: 'request-uuid',
    meta: {
      lastUpdated: '2023-01-01T00:00:00.000Z',
    },
    status: 'active' as any,
    intent: 'order',
    priority: 'routine',
    medicationReference: {
      reference: 'Medication/med-uuid',
      display: 'Test Medication',
    },
    subject: {
      reference: 'Patient/patient-uuid',
      display: 'Test Patient',
    },
    encounter: {
      reference: 'Encounter/enc-uuid',
      type: 'Encounter',
    },
    requester: {
      reference: 'Practitioner/prac-uuid',
      type: 'Practitioner',
      identifier: {
        value: 'PRAC123',
      },
      display: 'Test Practitioner',
    },
    dosageInstruction: [
      {
        timing: {
          code: {
            coding: [
              {
                code: 'timing-code',
                display: 'Once daily',
              },
            ],
          },
        },
        asNeededBoolean: false,
        route: {
          coding: [
            {
              code: 'route-code',
              display: 'Oral',
            },
          ],
        },
        doseAndRate: [
          {
            doseQuantity: {
              value: 1,
              code: '385055001',
            },
          },
        ],
      },
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: numberOfRepeatsAllowed,
      quantity: {
        value: 30,
        code: '385055001',
      },
      validityPeriod: {
        start: '2023-01-01',
      },
    },
  },
  dispenses: [],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConfig.mockReturnValue({
    dispenseBehavior: {
      allowModifyingPrescription: false,
      restrictTotalQuantityDispensed: false,
      completeOrderWithThisDispense: true,
    },
    enableStockDispense: false,
  });
  mockUsePatient.mockReturnValue({
    patient: mockPatient,
    isLoading: false,
    error: null,
    patientUuid: 'patient-uuid',
  } as any);
});

describe('DispenseForm - Complete Order Checkbox Auto-Default', () => {
  test('should default checkbox to true when numberOfRepeatsAllowed is 0', () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle(0);

    render(
      <DispenseForm
        {...mockWorkspaceProps}
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'enter',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 0,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).toBeChecked();
  });

  test('should default checkbox to true when numberOfRepeatsAllowed is null', () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle(null);

    render(
      <DispenseForm
        {...mockWorkspaceProps}
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'enter',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 0,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).toBeChecked();
  });

  test('should default checkbox to false when numberOfRepeatsAllowed is greater than 0', () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle(2);

    render(
      <DispenseForm
        {...mockWorkspaceProps}
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'enter',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 0,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).not.toBeChecked();
  });

  test('should allow user to manually uncheck the checkbox even when auto-defaulted to true', async () => {
    const user = userEvent.setup();
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle(0);

    render(
      <DispenseForm
        {...mockWorkspaceProps}
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'enter',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 0,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).toBeChecked();

    // User manually unchecks the checkbox
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('should not auto-default checkbox in edit mode', () => {
    const medicationDispense = createMockMedicationDispense();
    medicationDispense.id = 'existing-dispense-id'; // Existing dispense
    const medicationRequestBundle = createMockMedicationRequestBundle(0);

    render(
      <DispenseForm
        {...mockWorkspaceProps}
        workspaceProps={{
          medicationDispense,
          medicationRequestBundle,
          mode: 'edit',
          patientUuid: 'patient-uuid',
          encounterUuid: 'encounter-uuid',
          quantityRemaining: 30,
          quantityDispensed: 30,
        }}
        closeWorkspace={mockCloseWorkspace}
      />,
    );

    // In edit mode, the checkbox should not be rendered at all
    const checkbox = screen.queryByRole('checkbox', { name: /complete order with this dispense/i });
    expect(checkbox).not.toBeInTheDocument();
  });
});
