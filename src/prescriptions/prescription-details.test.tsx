import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { usePatientAllergies } from '../medication-request/medication-request.resource';
import PrescriptionDetails from './prescription-details.component';

jest.mock('../medication-request/medication-request.resource');

const mockUseConfig = jest.mocked(useConfig);
const mockUsePatientAllergies = jest.mocked(usePatientAllergies);

const mockPatientUuid = 'test-patient-uuid';

describe('PrescriptionDetails', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      refreshInterval: 10000,
      medicationRequestExpirationPeriodInDays: 90,
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: false,
      },
    });
  });

  describe('Allergies Display', () => {
    it('does not show allergies content while loading', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: undefined,
        error: undefined,
        isLoading: true,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      // While loading allergies, should not show allergy details or no allergies message
      expect(screen.queryByText(/no allergy details found/i)).not.toBeInTheDocument();
    });

    it('shows error message when fetching allergies fails', () => {
      const errorMessage = 'Network error';
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: undefined,
        error: new Error(errorMessage),
        isLoading: false,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/error loading allergies/i)).toBeInTheDocument();
    });

    it('shows no allergies message when patient has no allergies', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/no allergy details found/i)).toBeInTheDocument();
    });

    it('displays allergy count and names', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [
          {
            id: 'allergy-1',
            code: {
              text: 'Penicillin',
              coding: [{ code: '123', display: 'Penicillin' }],
            },
          },
          {
            id: 'allergy-2',
            code: {
              text: 'Aspirin',
              coding: [{ code: '456', display: 'Aspirin' }],
            },
          },
        ] as any,
        totalAllergies: 2,
        error: undefined,
        isLoading: false,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      // Translation mock doesn't interpolate, check for allergies text pattern
      expect(screen.getByText(/allergies/i)).toBeInTheDocument();
      expect(screen.getByText(/Penicillin/)).toBeInTheDocument();
      expect(screen.getByText(/Aspirin/)).toBeInTheDocument();
    });

    it('prefers code.text over coding.display for "Other" type allergies', () => {
      // This tests the fix we made for allergies like "Corn" where the coding
      // display shows "Other" but code.text contains the actual allergen name
      mockUsePatientAllergies.mockReturnValue({
        allergies: [
          {
            id: 'allergy-1',
            code: {
              text: 'Corn', // Should prefer this
              coding: [{ code: '5622', display: 'Other' }], // Over this
            },
          },
        ] as any,
        totalAllergies: 1,
        error: undefined,
        isLoading: false,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/Corn/)).toBeInTheDocument();
      expect(screen.queryByText('Other')).not.toBeInTheDocument();
    });

    it('falls back to coding.display when code.text is not available', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [
          {
            id: 'allergy-1',
            code: {
              coding: [{ code: '123', display: 'Sulfonamides' }],
            },
          },
        ] as any,
        totalAllergies: 1,
        error: undefined,
        isLoading: false,
      });

      render(<PrescriptionDetails patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/Sulfonamides/)).toBeInTheDocument();
    });
  });
});
