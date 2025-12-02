import { renderHook, act } from '@testing-library/react';
import { useDispenseUnitWarning } from './useDispenseUnitWarning';
import { type MedicationDispense, MedicationDispenseStatus } from '../types';

// Mock the OpenMRS framework
const mockShowNotification = jest.fn();
jest.mock('@openmrs/esm-framework', () => ({
  showNotification: (args: any) => mockShowNotification(args),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string, options?: Record<string, string>) => {
      if (options) {
        let result = defaultValue;
        Object.entries(options).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
        return result;
      }
      return defaultValue;
    },
  }),
}));

describe('useDispenseUnitWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockDispense = (unitCode: string, unitDisplay?: string): MedicationDispense => ({
    resourceType: 'MedicationDispense',
    status: MedicationDispenseStatus.completed,
    medicationReference: { reference: 'Medication/123', type: 'Medication' },
    subject: { reference: 'Patient/456', type: 'Patient' },
    performer: [{ actor: { reference: 'Practitioner/789' } }],
    location: { reference: 'Location/abc' },
    quantity: {
      value: 10,
      code: unitCode,
      unit: unitDisplay || unitCode,
    },
  });

  describe('when no previous dispenses exist', () => {
    it('should not warn when previousDispenses is undefined', () => {
      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses: undefined,
          currentUnitCode: 'tablet',
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.previousUnit).toBeNull();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not warn when previousDispenses is empty array', () => {
      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses: [],
          currentUnitCode: 'tablet',
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.previousUnit).toBeNull();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('when previous dispenses exist with same unit', () => {
    it('should not warn when units match', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses,
          currentUnitCode: 'tablet',
          currentUnitDisplay: 'Tablet',
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.previousUnit).toBe('tablet');
      expect(result.current.currentUnit).toBe('tablet');
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it('should not warn when units match (case-insensitive)', () => {
      const previousDispenses = [createMockDispense('TABLET', 'Tablet')];

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses,
          currentUnitCode: 'tablet',
          currentUnitDisplay: 'Tablet',
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe('when previous dispenses exist with different unit', () => {
    it('should warn when units differ', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses,
          currentUnitCode: 'mg',
          currentUnitDisplay: 'Milligram',
        }),
      );

      expect(result.current.shouldWarn).toBe(true);
      expect(result.current.previousUnit).toBe('tablet');
      expect(result.current.previousUnitDisplay).toBe('Tablet');
      expect(result.current.currentUnit).toBe('mg');
      expect(result.current.currentUnitDisplay).toBe('Milligram');
    });

    it('should show notification when unit changes to different unit', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      // Start with matching unit
      const { result, rerender } = renderHook(
        ({ currentUnitCode, currentUnitDisplay }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
            currentUnitDisplay,
          }),
        {
          initialProps: { currentUnitCode: 'tablet', currentUnitDisplay: 'Tablet' },
        },
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(mockShowNotification).not.toHaveBeenCalled();

      // Change to different unit
      rerender({ currentUnitCode: 'mg', currentUnitDisplay: 'Milligram' });

      expect(result.current.shouldWarn).toBe(true);
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'warning',
          title: 'Dispense Unit Mismatch',
        }),
      );
    });

    it('should include unit names in notification description', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { rerender } = renderHook(
        ({ currentUnitCode, currentUnitDisplay }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
            currentUnitDisplay,
          }),
        {
          initialProps: { currentUnitCode: 'tablet', currentUnitDisplay: 'Tablet' },
        },
      );

      // Change to different unit
      rerender({ currentUnitCode: 'mg', currentUnitDisplay: 'Milligram' });

      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Tablet'),
        }),
      );
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Milligram'),
        }),
      );
    });
  });

  describe('warning state management', () => {
    it('should track warningShown state', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result, rerender } = renderHook(
        ({ currentUnitCode }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
          }),
        {
          initialProps: { currentUnitCode: 'tablet' },
        },
      );

      expect(result.current.warningShown).toBe(false);

      // Change to different unit
      rerender({ currentUnitCode: 'mg' });

      expect(result.current.warningShown).toBe(true);
    });

    it('should reset warningShown when units match again', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result, rerender } = renderHook(
        ({ currentUnitCode }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
          }),
        {
          initialProps: { currentUnitCode: 'tablet' },
        },
      );

      // Change to different unit
      rerender({ currentUnitCode: 'mg' });
      expect(result.current.warningShown).toBe(true);

      // Change back to matching unit
      rerender({ currentUnitCode: 'tablet' });
      expect(result.current.warningShown).toBe(false);
    });

    it('should allow manual reset of warning state', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result, rerender } = renderHook(
        ({ currentUnitCode }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
          }),
        {
          initialProps: { currentUnitCode: 'tablet' },
        },
      );

      // Change to different unit
      rerender({ currentUnitCode: 'mg' });
      expect(result.current.warningShown).toBe(true);

      // Manually reset
      act(() => {
        result.current.resetWarning();
      });

      expect(result.current.warningShown).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null currentUnitCode', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses,
          currentUnitCode: null,
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.currentUnit).toBeNull();
    });

    it('should handle undefined currentUnitCode', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses,
          currentUnitCode: undefined,
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.currentUnit).toBeNull();
    });

    it('should handle dispenses without quantity', () => {
      const dispenseWithoutQuantity: MedicationDispense = {
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        medicationReference: { reference: 'Medication/123', type: 'Medication' },
        subject: { reference: 'Patient/456', type: 'Patient' },
        performer: [{ actor: { reference: 'Practitioner/789' } }],
        location: { reference: 'Location/abc' },
        quantity: undefined,
      };

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses: [dispenseWithoutQuantity],
          currentUnitCode: 'tablet',
        }),
      );

      expect(result.current.shouldWarn).toBe(false);
      expect(result.current.previousUnit).toBeNull();
    });

    it('should use first dispense with valid unit when multiple dispenses exist', () => {
      const dispenseWithoutUnit: MedicationDispense = {
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        medicationReference: { reference: 'Medication/123', type: 'Medication' },
        subject: { reference: 'Patient/456', type: 'Patient' },
        performer: [{ actor: { reference: 'Practitioner/789' } }],
        location: { reference: 'Location/abc' },
        quantity: { value: 5, code: '', unit: '' },
      };

      const dispenseWithUnit = createMockDispense('tablet', 'Tablet');
      const anotherDispense = createMockDispense('mg', 'Milligram');

      const { result } = renderHook(() =>
        useDispenseUnitWarning({
          previousDispenses: [dispenseWithoutUnit, dispenseWithUnit, anotherDispense],
          currentUnitCode: 'mg',
        }),
      );

      // Should use 'tablet' from the first dispense with a valid unit
      expect(result.current.previousUnit).toBe('tablet');
      expect(result.current.shouldWarn).toBe(true);
    });

    it('should not show duplicate notifications for same mismatch', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { rerender } = renderHook(
        ({ currentUnitCode }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
          }),
        {
          initialProps: { currentUnitCode: 'tablet' },
        },
      );

      // Change to different unit
      rerender({ currentUnitCode: 'mg' });
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Rerender with same mismatched unit
      rerender({ currentUnitCode: 'mg' });
      expect(mockShowNotification).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should show new notification when selecting a different mismatching unit', () => {
      const previousDispenses = [createMockDispense('tablet', 'Tablet')];

      const { rerender } = renderHook(
        ({ currentUnitCode, currentUnitDisplay }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
            currentUnitDisplay,
          }),
        {
          initialProps: { currentUnitCode: 'tablet', currentUnitDisplay: 'Tablet' },
        },
      );

      // Change to first different unit
      rerender({ currentUnitCode: 'mg', currentUnitDisplay: 'Milligram' });
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Change to another different unit - should show warning again
      rerender({ currentUnitCode: 'ml', currentUnitDisplay: 'Milliliter' });
      expect(mockShowNotification).toHaveBeenCalledTimes(2);

      // Change to yet another different unit - should show warning again
      rerender({ currentUnitCode: 'capsule', currentUnitDisplay: 'Capsule' });
      expect(mockShowNotification).toHaveBeenCalledTimes(3);
    });

    it('should reset warning state when previousDispenses changes (patient/prescription change)', () => {
      const patient1Dispenses = [createMockDispense('tablet', 'Tablet')];
      const patient2Dispenses = [createMockDispense('mg', 'Milligram')];

      const { result, rerender } = renderHook(
        ({ previousDispenses, currentUnitCode }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
          }),
        {
          initialProps: { previousDispenses: patient1Dispenses, currentUnitCode: 'tablet' },
        },
      );

      // Trigger warning for patient 1
      rerender({ previousDispenses: patient1Dispenses, currentUnitCode: 'mg' });
      expect(result.current.warningShown).toBe(true);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);

      // Switch to patient 2 (different previousDispenses) - should reset state
      rerender({ previousDispenses: patient2Dispenses, currentUnitCode: 'mg' });
      expect(result.current.warningShown).toBe(false);
      // No new warning because 'mg' matches patient2's unit
    });

    it('should show warning for new patient when units mismatch', () => {
      const patient1Dispenses = [createMockDispense('tablet', 'Tablet')];
      const patient2Dispenses = [createMockDispense('capsule', 'Capsule')];

      const { result, rerender } = renderHook(
        ({ previousDispenses, currentUnitCode, currentUnitDisplay }) =>
          useDispenseUnitWarning({
            previousDispenses,
            currentUnitCode,
            currentUnitDisplay,
          }),
        {
          initialProps: {
            previousDispenses: patient1Dispenses,
            currentUnitCode: 'tablet',
            currentUnitDisplay: 'Tablet',
          },
        },
      );

      // No warning for patient 1 (matching unit)
      expect(result.current.shouldWarn).toBe(false);
      expect(mockShowNotification).toHaveBeenCalledTimes(0);

      // Switch to patient 2 with mismatching unit
      rerender({
        previousDispenses: patient2Dispenses,
        currentUnitCode: 'tablet',
        currentUnitDisplay: 'Tablet',
      });

      // Should warn because patient 2's previous dispense was 'capsule' but we're trying 'tablet'
      expect(result.current.shouldWarn).toBe(true);
      expect(mockShowNotification).toHaveBeenCalledTimes(1);
    });
  });
});
