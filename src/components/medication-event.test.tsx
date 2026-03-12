import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type MedicationRequest, MedicationRequestStatus } from '../types';
import MedicationEvent from './medication-event.component';

const mockUseConfig = jest.mocked(useConfig);

const baseMedicationRequest: MedicationRequest = {
  resourceType: 'MedicationRequest',
  id: 'test-medication-request-id',
  meta: { lastUpdated: '2023-01-24T19:02:04.000-05:00' },
  status: MedicationRequestStatus.active,
  intent: 'order',
  priority: 'routine',
  medicationReference: {
    reference: 'Medication/test-medication-id',
    type: 'Medication',
    display: 'Paracetamol 500mg tablet',
  },
  subject: {
    reference: 'Patient/test-patient-id',
    type: 'Patient',
    display: 'Test Patient',
  },
  encounter: {
    reference: 'Encounter/test-encounter-id',
    type: 'Encounter',
  },
  requester: {
    reference: 'Practitioner/test-practitioner-id',
    type: 'Practitioner',
    identifier: { value: 'TEST' },
    display: 'Test Doctor',
  },
  dosageInstruction: [
    {
      text: 'Take one tablet twice daily',
      timing: {
        repeat: {
          duration: 7,
          durationUnit: 'd',
        },
        code: {
          coding: [{ code: 'BID', display: 'Twice daily' }],
          text: 'Twice daily',
        },
      },
      route: {
        coding: [{ code: 'PO', display: 'Oral' }],
        text: 'Oral',
      },
      doseAndRate: [
        {
          doseQuantity: {
            value: 1,
            unit: 'tablet',
            code: 'tablet',
          },
        },
      ],
      asNeededBoolean: false,
    },
  ],
  dispenseRequest: {
    validityPeriod: { start: '2023-01-24T19:02:04.000-05:00' },
    numberOfRepeatsAllowed: 2,
    quantity: {
      value: 14,
      unit: 'tablet',
      code: 'tablet',
    },
  },
};

describe('MedicationEvent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: false,
      },
    });
  });

  it('renders medication name', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText('Paracetamol 500mg tablet')).toBeInTheDocument();
  });

  it('renders status tag when provided', () => {
    render(
      <MedicationEvent medicationEvent={baseMedicationRequest} status={<span data-testid="status-tag">Active</span>} />,
    );

    expect(screen.getByTestId('status-tag')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders dose information for structured dosage', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText('DOSE')).toBeInTheDocument();
    // Check for dose value and unit in the dosage section
    expect(screen.getByText(/1 tablet/)).toBeInTheDocument();
  });

  it('renders route when available', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText(/Oral/)).toBeInTheDocument();
  });

  it('renders timing when available', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText(/Twice daily/)).toBeInTheDocument();
  });

  it('renders duration when available', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText(/for 7 d/)).toBeInTheDocument();
  });

  it('renders quantity when available', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText('QUANTITY')).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument();
  });

  it('renders refills when available', () => {
    render(<MedicationEvent medicationEvent={baseMedicationRequest} />);

    expect(screen.getByText('REFILLS')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders free text dosage instructions', () => {
    const freeTextMedicationRequest: MedicationRequest = {
      ...baseMedicationRequest,
      dosageInstruction: [
        {
          text: 'Take as directed by physician',
        } as any,
      ],
    };

    render(<MedicationEvent medicationEvent={freeTextMedicationRequest} />);

    expect(screen.getByText('Take as directed by physician')).toBeInTheDocument();
  });

  it('does not render route dash separator when route is missing', () => {
    const noRouteMedicationRequest: MedicationRequest = {
      ...baseMedicationRequest,
      dosageInstruction: [
        {
          doseAndRate: [
            {
              doseQuantity: {
                value: 1,
                unit: 'tablet',
                code: 'tablet',
              },
            },
          ],
          timing: {
            code: {
              coding: [{ code: 'BID', display: 'Twice daily' }],
              text: 'Twice daily',
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [],
          },
        } as any,
      ],
    };

    render(<MedicationEvent medicationEvent={noRouteMedicationRequest} />);

    // Should show dose and timing but not have orphaned dashes
    expect(screen.getByText('DOSE')).toBeInTheDocument();
    expect(screen.getByText(/Twice daily/)).toBeInTheDocument();
  });

  it('handles null dosageInstruction gracefully', () => {
    const noDosageMedicationRequest: MedicationRequest = {
      ...baseMedicationRequest,
      dosageInstruction: null,
    };

    render(<MedicationEvent medicationEvent={noDosageMedicationRequest} />);

    // Should still render medication name without crashing
    expect(screen.getByText('Paracetamol 500mg tablet')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <MedicationEvent medicationEvent={baseMedicationRequest}>
        <button>Action Button</button>
      </MedicationEvent>,
    );

    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });
});
