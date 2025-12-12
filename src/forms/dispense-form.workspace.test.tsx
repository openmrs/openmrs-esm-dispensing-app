import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import {
  type MedicationDispense,
  type MedicationRequestBundle,
  MedicationDispenseStatus,
  MedicationRequestStatus,
} from '../types';
import DispenseForm from './dispense-form.workspace';

// Only mock internal modules that make API calls - the framework mock is loaded via jest.config.js
jest.mock('../medication-dispense/medication-dispense.resource', () => ({
  saveMedicationDispense: jest.fn(() => Promise.resolve({ ok: true, status: 201 })),
}));

jest.mock('../medication-request/medication-request.resource', () => ({
  updateMedicationRequestFulfillerStatus: jest.fn(() => Promise.resolve()),
}));

jest.mock('./stock-dispense/stock.resource', () => ({
  createStockDispenseRequestPayload: jest.fn(),
  sendStockDispenseRequest: jest.fn(() => Promise.resolve()),
}));

// Mock child components to simplify testing form logic
jest.mock('./medication-dispense-review.component', () => {
  return jest.fn(({ medicationDispense, updateMedicationDispense }) => (
    <div data-testid="medication-dispense-review">
      <span data-testid="quantity-value">{medicationDispense?.quantity?.value}</span>
      <span data-testid="quantity-unit">{medicationDispense?.quantity?.code}</span>
      <button
        data-testid="change-unit-btn"
        onClick={() =>
          updateMedicationDispense({
            quantity: { ...medicationDispense.quantity, code: 'mg' },
          })
        }>
        Change Unit
      </button>
    </div>
  ));
});

jest.mock('./stock-dispense/stock-dispense.component', () => {
  return jest.fn(() => <div data-testid="stock-dispense">Stock Dispense</div>);
});

const mockUseConfig = jest.mocked(useConfig);
const mockUsePatient = jest.mocked(usePatient);

const createMockMedicationDispense = (unitCode = 'tablet', unitDisplay = 'Tablet'): MedicationDispense => ({
  resourceType: 'MedicationDispense',
  status: MedicationDispenseStatus.completed,
  medicationReference: {
    reference: 'Medication/123',
    type: 'Medication',
    display: 'Aspirin 100mg',
  },
  subject: {
    reference: 'Patient/456',
    type: 'Patient',
    display: 'Test Patient',
  },
  performer: [
    {
      actor: {
        reference: 'Practitioner/789',
        type: 'Practitioner',
        display: 'Dr. Test',
      },
    },
  ],
  location: {
    reference: 'Location/abc',
    type: 'Location',
    display: 'Pharmacy',
  },
  authorizingPrescription: [
    {
      reference: 'MedicationRequest/def',
      type: 'MedicationRequest',
    },
  ],
  quantity: {
    value: 30,
    code: unitCode,
    unit: unitDisplay,
  },
  dosageInstruction: [
    {
      text: 'Take 1 tablet daily',
      timing: {
        code: {
          coding: [{ code: 'daily', display: 'Daily' }],
        },
      },
      asNeededBoolean: false,
      route: {
        coding: [{ code: 'oral', display: 'Oral' }],
      },
      doseAndRate: [
        {
          doseQuantity: {
            value: 1,
            code: 'tablet',
            unit: 'Tablet',
          },
        },
      ],
    },
  ],
  substitution: {
    wasSubstituted: false,
    reason: [],
  },
});

const createMockMedicationRequestBundle = (previousDispenses: MedicationDispense[] = []): MedicationRequestBundle => ({
  request: {
    resourceType: 'MedicationRequest',
    id: 'request-123',
    status: MedicationRequestStatus.active,
    intent: 'order',
    priority: 'routine',
    medicationReference: {
      reference: 'Medication/123',
      type: 'Medication',
      display: 'Aspirin 100mg',
    },
    subject: {
      reference: 'Patient/456',
      type: 'Patient',
      display: 'Test Patient',
    },
    encounter: {
      reference: 'Encounter/789',
      type: 'Encounter',
    },
    requester: {
      reference: 'Practitioner/abc',
      type: 'Practitioner',
      identifier: { value: 'DOC123' },
      display: 'Dr. Requester',
    },
    dosageInstruction: [
      {
        text: 'Take 1 tablet daily',
        timing: {
          code: {
            coding: [{ code: 'daily', display: 'Daily' }],
          },
        },
        asNeededBoolean: false,
        route: {
          coding: [{ code: 'oral', display: 'Oral' }],
        },
        doseAndRate: [
          {
            doseQuantity: {
              value: 1,
              code: 'tablet',
              unit: 'Tablet',
            },
          },
        ],
      },
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: 0,
      quantity: {
        value: 30,
        code: 'tablet',
        unit: 'Tablet',
      },
      validityPeriod: {
        start: '2023-01-01',
      },
    },
    meta: {
      lastUpdated: '2023-01-01T00:00:00Z',
    },
  },
  dispenses: previousDispenses,
});

const defaultWorkspaceProps = {
  medicationDispense: createMockMedicationDispense(),
  medicationRequestBundle: createMockMedicationRequestBundle(),
  mode: 'enter' as const,
  patientUuid: 'patient-123',
  encounterUuid: 'encounter-456',
  quantityRemaining: 30,
  quantityDispensed: 0,
};

const renderDispenseForm = (workspaceProps = defaultWorkspaceProps) => {
  const closeWorkspace = jest.fn();
  const mockLaunchChildWorkspace = jest.fn();

  const props = {
    workspaceProps,
    closeWorkspace,
    launchChildWorkspace: mockLaunchChildWorkspace,
    windowProps: {},
    groupProps: {},
    workspaceName: 'dispense-form',
    workspaceUuid: 'test-uuid',
    workspaceContext: {},
  } as any;

  return {
    ...render(<DispenseForm {...props} />),
    closeWorkspace,
  };
};

describe('DispenseForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConfig.mockReturnValue({
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: true,
      },
      enableStockDispense: false,
      completeOrderWithThisDispense: false,
    });

    mockUsePatient.mockReturnValue({
      patient: { id: 'patient-123', name: [{ given: ['Test'], family: 'Patient' }] },
      isLoading: false,
      error: null,
      patientUuid: 'patient-123',
    });
  });

  describe('Form rendering and basic functionality', () => {
    it('should render the dispense form with medication details and action buttons', async () => {
      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('medication-dispense-review')).toBeInTheDocument();
        expect(screen.getByTestId('quantity-value')).toHaveTextContent('30');
        expect(screen.getByTestId('quantity-unit')).toHaveTextContent('tablet');
      });

      // Both buttons should be present and cancel should be enabled
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /dispense prescription/i })).toBeInTheDocument();
    });

    it('should call closeWorkspace when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const { closeWorkspace } = renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(closeWorkspace).toHaveBeenCalled();
    });
  });

  describe('Stock dispense integration', () => {
    it('should conditionally render stock dispense based on enableStockDispense config', async () => {
      // Test with enableStockDispense: false (default from beforeEach)
      const { unmount } = renderDispenseForm();

      await waitFor(() => {
        expect(screen.queryByTestId('stock-dispense')).not.toBeInTheDocument();
      });

      unmount();

      // Test with enableStockDispense: true
      mockUseConfig.mockReturnValue({
        dispenseBehavior: {
          allowModifyingPrescription: false,
          restrictTotalQuantityDispensed: true,
        },
        enableStockDispense: true,
        completeOrderWithThisDispense: false,
      });

      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('stock-dispense')).toBeInTheDocument();
      });
    });
  });

  describe('Unit mismatch validation - graceful handling', () => {
    it('should not crash when dispensing with different units from previous dispenses', async () => {
      const previousDispense = createMockMedicationDispense('tablet', 'Tablet');
      const currentDispense = createMockMedicationDispense('mg', 'Milligram');
      const bundle = createMockMedicationRequestBundle([previousDispense]);

      // Should not throw - this tests the fix for O3-5052
      expect(() =>
        renderDispenseForm({
          ...defaultWorkspaceProps,
          medicationDispense: currentDispense,
          medicationRequestBundle: bundle,
        }),
      ).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('medication-dispense-review')).toBeInTheDocument();
      });
    });

    it('should handle empty dispenses array gracefully', async () => {
      const bundle = createMockMedicationRequestBundle([]);

      renderDispenseForm({
        ...defaultWorkspaceProps,
        medicationRequestBundle: bundle,
      });

      await waitFor(() => {
        expect(screen.getByTestId('medication-dispense-review')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('should handle undefined dispenses gracefully', async () => {
      const bundle = {
        ...createMockMedicationRequestBundle([]),
        dispenses: undefined,
      };

      renderDispenseForm({
        ...defaultWorkspaceProps,
        medicationRequestBundle: bundle as MedicationRequestBundle,
      });

      await waitFor(() => {
        expect(screen.getByTestId('medication-dispense-review')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });
  });
});
