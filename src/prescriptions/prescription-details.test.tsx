import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExtensionSlot, getAssignedExtensions, useConfig } from '@openmrs/esm-framework';
import { usePrescriptionDetails, usePatientAllergies } from '../medication-request/medication-request.resource';
import { useStaleEncounterUuids } from '../utils';
import type * as EsmFramework from '@openmrs/esm-framework';
import type * as Utils from '../utils';
import { type MedicationRequest, type MedicationRequestBundle, MedicationRequestStatus } from '../types';
import PrescriptionDetails from './prescription-details.component';

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal<typeof EsmFramework>()),
  getAssignedExtensions: vi.fn(() => []),
}));
vi.mock('../components/action-buttons.component', () => ({ default: () => null }));
vi.mock('./prescription-actions.component', () => ({ default: () => null }));
vi.mock('../medication-request/medication-request.resource');
vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof Utils>();
  return {
    ...actual,
    useStaleEncounterUuids: vi.fn(),
  };
});

const mockUseConfig = vi.mocked(useConfig);
const mockUsePrescriptionDetails = vi.mocked(usePrescriptionDetails);
const mockUsePatientAllergies = vi.mocked(usePatientAllergies);
const mockUseStaleEncounterUuids = vi.mocked(useStaleEncounterUuids);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockGetAssignedExtensions = vi.mocked(getAssignedExtensions);

const mockEncounterUuid = 'test-encounter-uuid';
const mockPatientUuid = 'test-patient-uuid';

function buildRequest(overrides?: Partial<MedicationRequest>): MedicationRequest {
  return {
    resourceType: 'MedicationRequest',
    id: 'request-1',
    meta: { lastUpdated: '2023-01-24T19:02:04.000-05:00' },
    status: MedicationRequestStatus.active,
    intent: 'order',
    priority: 'routine',
    medicationReference: {
      reference: 'Medication/drug-uuid-1',
      type: 'Medication',
      display: 'Paracetamol 500mg tablet',
    },
    subject: { reference: 'Patient/test-patient-id', type: 'Patient', display: 'Test Patient' },
    dosageInstruction: [{ text: 'Take one tablet twice daily' }],
    dispenseRequest: { validityPeriod: { start: '2023-01-24T19:02:04.000-05:00' } },
    ...overrides,
  } as MedicationRequest;
}

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
    mockUseStaleEncounterUuids.mockReturnValue({
      staleEncounterUuids: [],
    });
    mockGetAssignedExtensions.mockReturnValue([]);
  });

  describe('Allergies Display', () => {
    it('does not show allergies content while loading', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: undefined,
        error: undefined,
        isLoading: true,
      });
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

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
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/error loading allergies/i)).toBeInTheDocument();
    });

    it('shows no allergies message when patient has no allergies', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

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
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

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
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

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
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/Sulfonamides/)).toBeInTheDocument();
    });
  });

  describe('Prescriptions Display', () => {
    it('shows loading skeleton while fetching prescriptions', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      expect(screen.getByText('Prescribed')).toBeInTheDocument();
    });

    it('shows error message when fetching prescriptions fails', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: new Error('Failed to load'),
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/error loading prescription details/i)).toBeInTheDocument();
    });

    it('shows empty state when no prescriptions exist', () => {
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      expect(screen.getByText(/no prescriptions found/i)).toBeInTheDocument();
    });
  });

  describe('Side effects extension slot', () => {
    beforeEach(() => {
      mockExtensionSlot.mockClear();
      mockGetAssignedExtensions.mockReturnValue([{ name: 'medication-side-effects-panel-dispensing' }] as any);
      mockUsePatientAllergies.mockReturnValue({
        allergies: [],
        totalAllergies: 0,
        error: undefined,
        isLoading: false,
      });
    });

    it('mounts the side effects slot with the drug uuid parsed from the medication reference', () => {
      const bundle: MedicationRequestBundle = { request: buildRequest(), dispenses: [] };
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [bundle],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      const slotCall = mockExtensionSlot.mock.calls.find(
        (call) => call[0].name === 'dispensing-prescription-side-effects-slot',
      );
      expect(slotCall).toBeTruthy();
      expect(slotCall?.[0].state).toEqual({ drugUuid: 'drug-uuid-1' });
    });

    it('does not mount the side effects slot for a request without a medication reference', () => {
      const bundle: MedicationRequestBundle = {
        request: buildRequest({
          medicationReference: undefined,
          medicationCodeableConcept: { coding: [{ code: '123', display: 'Paracetamol' }], text: 'Paracetamol' },
        }),
        dispenses: [],
      };
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [bundle],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      const slotCall = mockExtensionSlot.mock.calls.find(
        (call) => call[0].name === 'dispensing-prescription-side-effects-slot',
      );
      expect(slotCall).toBeUndefined();
    });

    it('does not mount the side effects slot when no extension is assigned to it', () => {
      mockGetAssignedExtensions.mockReturnValue([]);
      const bundle: MedicationRequestBundle = { request: buildRequest(), dispenses: [] };
      mockUsePrescriptionDetails.mockReturnValue({
        medicationRequestBundles: [bundle],
        prescriptionDate: new Date(),
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      render(<PrescriptionDetails encounterUuid={mockEncounterUuid} patientUuid={mockPatientUuid} />);

      const slotCall = mockExtensionSlot.mock.calls.find(
        (call) => call[0].name === 'dispensing-prescription-side-effects-slot',
      );
      expect(slotCall).toBeUndefined();
    });
  });
});
