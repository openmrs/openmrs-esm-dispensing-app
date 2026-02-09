import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePagination } from '@openmrs/esm-framework';
import { usePatientConditions } from './conditions.resource';
import PatientConditions from './conditions.component';

jest.mock('./conditions.resource', () => ({
  usePatientConditions: jest.fn(),
  pageSizesOptions: [3, 5, 10],
}));

const mockUsePatientConditions = jest.mocked(usePatientConditions);
const mockUsePagination = jest.mocked(usePagination);

const mockPatientUuid = 'test-patient-uuid';

describe('PatientConditions', () => {
  beforeEach(() => {
    mockUsePagination.mockReturnValue({
      results: [],
      currentPage: 1,
      goTo: jest.fn(),
      goToNext: jest.fn(),
      goToPrevious: jest.fn(),
      paginated: false,
      showNextButton: false,
      showPreviousButton: false,
      totalPages: 1,
    });
  });

  it('renders loading skeleton while fetching conditions', () => {
    mockUsePatientConditions.mockReturnValue({
      conditions: [],
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    // DataTableSkeleton renders a table with skeleton rows
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders error state when fetching fails', () => {
    const errorMessage = 'Failed to fetch conditions';
    mockUsePatientConditions.mockReturnValue({
      conditions: [],
      error: new Error(errorMessage),
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('renders empty state when no conditions exist', () => {
    mockUsePatientConditions.mockReturnValue({
      conditions: [],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    // Verify EmptyCard is rendered with correct header title
    expect(screen.getByTestId('empty-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Active conditions' })).toBeInTheDocument();
  });

  it('renders conditions table with data', () => {
    const conditions = [
      {
        id: 'condition-1',
        display: 'Hypertension',
        onsetDateTime: '15-Jan-2024',
        patient: 'Test Patient',
        recordedDate: '2024-01-15',
        recorder: 'Dr. Smith',
        status: 'active' as const,
      },
      {
        id: 'condition-2',
        display: 'Diabetes',
        onsetDateTime: '10-Dec-2023',
        patient: 'Test Patient',
        recordedDate: '2023-12-10',
        recorder: 'Dr. Jones',
        status: 'active' as const,
      },
    ];

    mockUsePatientConditions.mockReturnValue({
      conditions,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    mockUsePagination.mockReturnValue({
      results: conditions,
      currentPage: 1,
      goTo: jest.fn(),
      goToNext: jest.fn(),
      goToPrevious: jest.fn(),
      paginated: false,
      showNextButton: false,
      showPreviousButton: false,
      totalPages: 1,
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    expect(screen.getByText('Active conditions')).toBeInTheDocument();
    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
    expect(screen.getByText('15-Jan-2024')).toBeInTheDocument();
    expect(screen.getByText('10-Dec-2023')).toBeInTheDocument();
  });

  it('displays double dash for missing onset date', () => {
    const conditions = [
      {
        id: 'condition-1',
        display: 'Headache',
        onsetDateTime: null,
        patient: 'Test Patient',
        recordedDate: '2024-01-15',
        recorder: 'Dr. Smith',
        status: 'active' as const,
      },
    ];

    mockUsePatientConditions.mockReturnValue({
      conditions,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    mockUsePagination.mockReturnValue({
      results: conditions,
      currentPage: 1,
      goTo: jest.fn(),
      goToNext: jest.fn(),
      goToPrevious: jest.fn(),
      paginated: false,
      showNextButton: false,
      showPreviousButton: false,
      totalPages: 1,
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    expect(screen.getByText('Headache')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    const conditions = [
      {
        id: 'condition-1',
        display: 'Test Condition',
        onsetDateTime: '01-Jan-2024',
        patient: 'Test Patient',
        recordedDate: '2024-01-01',
        recorder: 'Dr. Test',
        status: 'active' as const,
      },
    ];

    mockUsePatientConditions.mockReturnValue({
      conditions,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    mockUsePagination.mockReturnValue({
      results: conditions,
      currentPage: 1,
      goTo: jest.fn(),
      goToNext: jest.fn(),
      goToPrevious: jest.fn(),
      paginated: false,
      showNextButton: false,
      showPreviousButton: false,
      totalPages: 1,
    });

    render(<PatientConditions patientUuid={mockPatientUuid} />);

    expect(screen.getByText('Condition')).toBeInTheDocument();
    expect(screen.getByText('Onset date')).toBeInTheDocument();
  });
});
