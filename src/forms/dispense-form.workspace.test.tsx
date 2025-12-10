import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePatient, showSnackbar } from '@openmrs/esm-framework';
import {
  type MedicationDispense,
  type MedicationRequestBundle,
  MedicationDispenseStatus,
  MedicationRequestStatus,
} from '../types';
import DispenseForm from './dispense-form.workspace';

// Mock the OpenMRS framework
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  usePatient: jest.fn(),
  showSnackbar: jest.fn(),
  showNotification: jest.fn(),
  getCoreTranslation: jest.fn((key, defaultValue) => defaultValue),
  ExtensionSlot: jest.fn(() => null),
  createGlobalStore: jest.fn(() => ({
    getState: jest.fn(() => ({ staleEncounterUuids: [] })),
    setState: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  })),
  useStore: jest.fn(() => ({ staleEncounterUuids: [] })),
  fhirBaseUrl: '/ws/fhir2/R4',
  parseDate: jest.fn((date) => new Date(date)),
  Workspace2: jest.fn(({ children, title }) => (
    <div data-testid="workspace2">
      <h1>{title}</h1>
      {children}
    </div>
  )),
}));

// Mock the medication-dispense resource
jest.mock('../medication-dispense/medication-dispense.resource', () => ({
  saveMedicationDispense: jest.fn(() => Promise.resolve({ ok: true, status: 201 })),
}));

// Mock the medication-request resource
jest.mock('../medication-request/medication-request.resource', () => ({
  updateMedicationRequestFulfillerStatus: jest.fn(() => Promise.resolve()),
}));

// Mock the stock dispense resource
jest.mock('./stock-dispense/stock.resource', () => ({
  createStockDispenseRequestPayload: jest.fn(),
  sendStockDispenseRequest: jest.fn(() => Promise.resolve()),
}));

// Mock the utils
jest.mock('../utils', () => {
  const actualUtils = jest.requireActual('../utils');
  return {
    ...actualUtils,
    markEncounterAsStale: jest.fn(),
    revalidate: jest.fn(),
    validateDispenseQuantity: jest.fn((records) => {
      // Simple validation: check if all units match
      const units = records.map((r) => r.unit).filter((u) => u);
      const uniqueUnits = new Set(units);

      if (uniqueUnits.size > 1) {
        return {
          isValid: false,
          totalQuantity: records.reduce((sum, r) => sum + (r.quantity || 0), 0),
          warnings: ['Different dispense units detected. Please review quantities.'],
        };
      }

      return {
        isValid: true,
        totalQuantity: records.reduce((sum, r) => sum + (r.quantity || 0), 0),
        warnings: [],
      };
    }),
    useStaleEncounterUuids: jest.fn(() => ({ staleEncounterUuids: [] })),
  };
});

// Mock the hooks
jest.mock('../hooks', () => ({
  useDispenseUnitWarning: jest.fn(() => ({
    shouldWarn: false,
    previousUnit: null,
    previousUnitDisplay: null,
    currentUnit: null,
    currentUnitDisplay: null,
    resetWarning: jest.fn(),
    warningShown: false,
  })),
}));

// Mock MedicationDispenseReview component
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

// Mock StockDispense component
jest.mock('./stock-dispense/stock-dispense.component', () => {
  return jest.fn(() => <div data-testid="stock-dispense">Stock Dispense</div>);
});

const mockUseConfig = jest.mocked(useConfig);
const mockUsePatient = jest.mocked(usePatient);
const mockShowSnackbar = jest.mocked(showSnackbar);

const createMockMedicationDispense = (
  unitCode = 'tablet',
  unitDisplay = 'Tablet',
): MedicationDispense => ({
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
            code: unitCode,
            unit: unitDisplay,
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

const createMockMedicationRequestBundle = (
  previousDispenses: MedicationDispense[] = [],
  numberOfRepeatsAllowed: number | null = 0,
): MedicationRequestBundle => ({
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
      numberOfRepeatsAllowed,
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

describe('DispenseForm Component - Unit Mismatch Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConfig.mockReturnValue({
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: true,
      },
      enableStockDispense: false,
      completeOrderWithThisDispense: true,
    } as any);

    mockUsePatient.mockReturnValue({
      patient: { id: 'patient-123', name: [{ given: ['Test'], family: 'Patient' }] },
      isLoading: false,
      error: null,
      patientUuid: 'patient-123',
    } as any);
  });

  describe('Unit mismatch warning notification', () => {
    it('should display warning notification when units mismatch with previous dispense', async () => {
      const previousDispense = createMockMedicationDispense('tablet', 'Tablet');
      const currentDispense = createMockMedicationDispense('mg', 'Milligram');

      const bundle = createMockMedicationRequestBundle([previousDispense]);

      renderDispenseForm({
        ...defaultWorkspaceProps,
        medicationDispense: currentDispense,
        medicationRequestBundle: bundle,
      });

      // Wait for validation to complete and warning to appear
      await waitFor(() => {
        const warning = screen.queryByText('Unit Mismatch Warning');
        expect(warning).toBeInTheDocument();
      });
    });
  });

  describe('Button disabled state with warnings', () => {
    it('should disable dispense button when unit mismatch warning exists and not confirmed', async () => {
      const previousDispense = createMockMedicationDispense('tablet', 'Tablet');
      const currentDispense = createMockMedicationDispense('mg', 'Milligram');
      const bundle = createMockMedicationRequestBundle([previousDispense]);

      renderDispenseForm({
        ...defaultWorkspaceProps,
        medicationDispense: currentDispense,
        medicationRequestBundle: bundle,
      });

      await waitFor(() => {
        const dispenseButton = screen.getByRole('button', { name: /dispense prescription/i });
        expect(dispenseButton).toBeDisabled();
      });
    });

    it('should render the cancel button as enabled', async () => {
      renderDispenseForm();

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });

  describe('Button enabled after user confirmation', () => {
    it('should enable dispense button after user confirms unit mismatch', async () => {
      const user = userEvent.setup();

      const previousDispense = createMockMedicationDispense('tablet', 'Tablet');
      const currentDispense = createMockMedicationDispense('mg', 'Milligram');
      const bundle = createMockMedicationRequestBundle([previousDispense]);

      renderDispenseForm({
        ...defaultWorkspaceProps,
        medicationDispense: currentDispense,
        medicationRequestBundle: bundle,
      });

      // Wait for warning to appear
      await waitFor(() => {
        expect(screen.getByText('Unit Mismatch Warning')).toBeInTheDocument();
      });

      // Find and click the confirmation checkbox
      const confirmCheckbox = screen.getByRole('checkbox', {
        name: /I understand the units differ and want to proceed/i,
      });

      await user.click(confirmCheckbox);

      // Button should now be enabled
      await waitFor(() => {
        const dispenseButton = screen.getByRole('button', { name: /dispense prescription/i });
        expect(dispenseButton).not.toBeDisabled();
      });
    });
  });

  describe('Form rendering', () => {
    it('should render the dispense form workspace', async () => {
      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('workspace2')).toBeInTheDocument();
      });
    });

    it('should render medication dispense review component', async () => {
      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('medication-dispense-review')).toBeInTheDocument();
      });
    });

    it('should display quantity value from medication dispense', async () => {
      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('quantity-value')).toHaveTextContent('30');
      });
    });

    it('should display unit code from medication dispense', async () => {
      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('quantity-unit')).toHaveTextContent('tablet');
      });
    });
  });

  describe('Cancel button behavior', () => {
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
    it('should not render stock dispense when enableStockDispense is false', async () => {
      mockUseConfig.mockReturnValue({
        dispenseBehavior: {
          allowModifyingPrescription: false,
          restrictTotalQuantityDispensed: true,
        },
        enableStockDispense: false,
        completeOrderWithThisDispense: false,
      } as any);

      renderDispenseForm();

      await waitFor(() => {
        expect(screen.queryByTestId('stock-dispense')).not.toBeInTheDocument();
      });
    });

    it('should render stock dispense when enableStockDispense is true', async () => {
      mockUseConfig.mockReturnValue({
        dispenseBehavior: {
          allowModifyingPrescription: false,
          restrictTotalQuantityDispensed: true,
        },
        enableStockDispense: true,
        completeOrderWithThisDispense: false,
      } as any);

      renderDispenseForm();

      await waitFor(() => {
        expect(screen.getByTestId('stock-dispense')).toBeInTheDocument();
      });
    });
  });
});

describe('DispenseForm - Complete Order Checkbox Auto-Default', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConfig.mockReturnValue({
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: false,
      },
      completeOrderWithThisDispense: true,
      enableStockDispense: false,
    } as any);

    mockUsePatient.mockReturnValue({
      patient: { id: 'patient-123', name: [{ given: ['Test'], family: 'Patient' }] },
      isLoading: false,
      error: null,
      patientUuid: 'patient-123',
    } as any);
  });

  test('should default checkbox to true when numberOfRepeatsAllowed is 0', async () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle([], 0);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationDispense,
      medicationRequestBundle,
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
      expect(checkbox).toBeChecked();
    });
  });

  test('should default checkbox to true when numberOfRepeatsAllowed is null', async () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle([], null);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationDispense,
      medicationRequestBundle,
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
      expect(checkbox).toBeChecked();
    });
  });

  test('should default checkbox to false when numberOfRepeatsAllowed is greater than 0', async () => {
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle([], 2);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationDispense,
      medicationRequestBundle,
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  test('should allow user to manually uncheck the checkbox even when auto-defaulted to true', async () => {
    const user = userEvent.setup();
    const medicationDispense = createMockMedicationDispense();
    const medicationRequestBundle = createMockMedicationRequestBundle([], 0);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationDispense,
      medicationRequestBundle,
    });

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
      expect(checkbox).toBeChecked();
    });

    const checkbox = screen.getByRole('checkbox', { name: /complete order with this dispense/i });
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  test('should not auto-default checkbox in edit mode', async () => {
    const medicationDispense = createMockMedicationDispense();
    medicationDispense.id = 'existing-dispense-id'; // Existing dispense
    const medicationRequestBundle = createMockMedicationRequestBundle([], 0);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationDispense,
      medicationRequestBundle,
      mode: 'edit',
    });

    // In edit mode, the checkbox should not be rendered
    await waitFor(() => {
      const checkbox = screen.queryByRole('checkbox', { name: /complete order with this dispense/i });
      expect(checkbox).not.toBeInTheDocument();
    });
  });
});

describe('DispenseForm Unit Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseConfig.mockReturnValue({
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: true,
      },
      enableStockDispense: false,
      completeOrderWithThisDispense: false,
    } as any);

    mockUsePatient.mockReturnValue({
      patient: { id: 'patient-123', name: [{ given: ['Test'], family: 'Patient' }] },
      isLoading: false,
      error: null,
      patientUuid: 'patient-123',
    } as any);
  });

  it('should validate dispense quantity when form loads with previous dispenses', async () => {
    const previousDispense = createMockMedicationDispense('tablet', 'Tablet');
    const bundle = createMockMedicationRequestBundle([previousDispense]);

    renderDispenseForm({
      ...defaultWorkspaceProps,
      medicationRequestBundle: bundle,
    });

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
    });

    // Form should render without crashing
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
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
    });

    // Form should render without crashing
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});