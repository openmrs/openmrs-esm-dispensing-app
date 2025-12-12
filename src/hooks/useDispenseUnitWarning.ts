import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification } from '@openmrs/esm-framework';
import { type MedicationDispense } from '../types';

/**
 * Return type for the useDispenseUnitWarning hook
 */
export interface DispenseUnitWarningResult {
  /** Whether a warning should be shown (units differ) */
  shouldWarn: boolean;
  /** The unit from the first/previous dispense, null if no previous dispenses */
  previousUnit: string | null;
  /** The display name of the previous unit (e.g., "Tablet" instead of code) */
  previousUnitDisplay: string | null;
  /** The current unit code being selected */
  currentUnit: string | null;
  /** The display name of the current unit */
  currentUnitDisplay: string | null;
  /** Reset the warning state (e.g., after user acknowledges) */
  resetWarning: () => void;
  /** Whether a warning notification has been shown for the current mismatch */
  warningShown: boolean;
}

/**
 * Props for the useDispenseUnitWarning hook
 */
export interface UseDispenseUnitWarningProps {
  /** Array of previous medication dispenses for this prescription */
  previousDispenses: Array<MedicationDispense> | undefined;
  /** The current unit code being selected in the form */
  currentUnitCode: string | null | undefined;
  /** The current unit display name (e.g., "Tablet") */
  currentUnitDisplay?: string | null;
}

/**
 * Custom hook to track and warn about dispense unit mismatches.
 *
 * This hook monitors when a user selects a different unit than what was used
 * in previous dispenses for the same prescription. It shows a warning notification
 * to alert the user before they proceed with potentially incompatible units.
 *
 * @param props - The hook configuration
 * @returns DispenseUnitWarningResult with warning state and unit information
 *
 * @example
 * ```tsx
 * const { shouldWarn, previousUnit, currentUnit } = useDispenseUnitWarning({
 *   previousDispenses: medicationRequestBundle.dispenses,
 *   currentUnitCode: medicationDispensePayload?.quantity?.code,
 *   currentUnitDisplay: medicationDispensePayload?.quantity?.unit,
 * });
 *
 * if (shouldWarn) {
 *   // Show warning UI or disable submit button
 * }
 * ```
 */
export function useDispenseUnitWarning({
  previousDispenses,
  currentUnitCode,
  currentUnitDisplay,
}: UseDispenseUnitWarningProps): DispenseUnitWarningResult {
  const { t } = useTranslation();

  // Track whether we've shown a warning for the current unit selection
  const [warningShown, setWarningShown] = useState(false);

  // Track the last unit code we showed a warning for (to detect new selections)
  const lastWarnedUnitCodeRef = useRef<string | null>(null);

  // Track previous dispenses identity to detect patient/prescription changes
  const previousDispensesRef = useRef<Array<MedicationDispense> | undefined>(undefined);

  /**
   * Get the first dispense unit from previous dispenses.
   * Returns both the code and display name.
   */
  const firstDispenseUnit = useMemo(() => {
    if (!previousDispenses || previousDispenses.length === 0) {
      return { code: null, display: null };
    }

    // Find the first dispense that has a quantity with a unit code
    const firstDispenseWithUnit = previousDispenses.find(
      (dispense) => dispense.quantity?.code && dispense.quantity.code.trim() !== '',
    );

    if (!firstDispenseWithUnit) {
      return { code: null, display: null };
    }

    return {
      code: firstDispenseWithUnit.quantity?.code || null,
      display: firstDispenseWithUnit.quantity?.unit || firstDispenseWithUnit.quantity?.code || null,
    };
  }, [previousDispenses]);

  /**
   * Reset state when patient/prescription changes (previousDispenses changes)
   */
  useEffect(() => {
    // Check if previousDispenses has changed (different patient/prescription)
    if (previousDispenses !== previousDispensesRef.current) {
      // Reset warning state for new patient/prescription
      setWarningShown(false);
      lastWarnedUnitCodeRef.current = null;
      previousDispensesRef.current = previousDispenses;
    }
  }, [previousDispenses]);

  /**
   * Determine if we should warn about unit mismatch
   */
  const shouldWarn = useMemo(() => {
    // No warning if there's no previous dispense unit
    if (!firstDispenseUnit.code) {
      return false;
    }

    // No warning if current unit is not set
    if (!currentUnitCode) {
      return false;
    }

    // Compare units (case-insensitive)
    const previousLower = firstDispenseUnit.code.toLowerCase();
    const currentLower = currentUnitCode.toLowerCase();

    return previousLower !== currentLower;
  }, [firstDispenseUnit.code, currentUnitCode]);

  /**
   * Show notification when unit mismatch is detected and it's a new selection
   */
  useEffect(() => {
    // Only show notification if:
    // 1. We should warn (units differ)
    // 2. This is a different unit than the last one we warned about
    //    (so warning shows again when user selects a different mismatching unit)
    if (shouldWarn && currentUnitCode && lastWarnedUnitCodeRef.current !== currentUnitCode) {
      const previousDisplay = firstDispenseUnit.display || firstDispenseUnit.code || 'unknown';
      const currentDisplay = currentUnitDisplay || currentUnitCode || 'unknown';

      showNotification({
        kind: 'warning',
        title: t('unitMismatchWarningTitle', 'Dispense Unit Mismatch'),
        description: t(
          'unitMismatchWarningDescription',
          'The previous dispense was in {{previousUnit}}. Are you sure you want to dispense in {{currentUnit}}?',
          {
            previousUnit: previousDisplay,
            currentUnit: currentDisplay,
          },
        ),
        millis: 10000, // Show for 10 seconds
      });

      setWarningShown(true);
      lastWarnedUnitCodeRef.current = currentUnitCode;
    }

    // Reset warningShown when units match again
    if (!shouldWarn && warningShown) {
      setWarningShown(false);
      lastWarnedUnitCodeRef.current = null;
    }
  }, [shouldWarn, currentUnitCode, currentUnitDisplay, firstDispenseUnit, t, warningShown]);

  /**
   * Reset the warning state manually (keeps track of current unit to prevent re-triggering)
   */
  const resetWarning = () => {
    setWarningShown(false);
    // Don't reset lastWarnedUnitCodeRef - this prevents the notification from re-appearing
    // for the same unit code after manual reset
  };

  return {
    shouldWarn,
    previousUnit: firstDispenseUnit.code,
    previousUnitDisplay: firstDispenseUnit.display,
    currentUnit: currentUnitCode || null,
    currentUnitDisplay: currentUnitDisplay || null,
    resetWarning,
    warningShown,
  };
}

export default useDispenseUnitWarning;
