import React from 'react';
import { useTranslation } from 'react-i18next';

interface PrescriptionDurationProps {
  duration: number;
  /** FHIR Timing.repeat.durationUnit code (UnitsOfTime): s | min | h | d | wk | mo | a */
  durationUnit?: string;
}

/**
 * Renders "for 5 days" from a FHIR timing duration, translated and pluralised,
 * instead of the raw UnitsOfTime code ("for 5 d").
 */
export function usePrescriptionDurationText() {
  const { t } = useTranslation();

  return (duration: number, durationUnit?: string): string => {
    const count = Number(duration);
    switch (durationUnit) {
      case 's':
        return t('forDurationSeconds', {
          count,
          defaultValue_one: 'for {{count}} second',
          defaultValue_other: 'for {{count}} seconds',
        });
      case 'min':
        return t('forDurationMinutes', {
          count,
          defaultValue_one: 'for {{count}} minute',
          defaultValue_other: 'for {{count}} minutes',
        });
      case 'h':
        return t('forDurationHours', {
          count,
          defaultValue_one: 'for {{count}} hour',
          defaultValue_other: 'for {{count}} hours',
        });
      case 'd':
        return t('forDurationDays', {
          count,
          defaultValue_one: 'for {{count}} day',
          defaultValue_other: 'for {{count}} days',
        });
      case 'wk':
        return t('forDurationWeeks', {
          count,
          defaultValue_one: 'for {{count}} week',
          defaultValue_other: 'for {{count}} weeks',
        });
      case 'mo':
        return t('forDurationMonths', {
          count,
          defaultValue_one: 'for {{count}} month',
          defaultValue_other: 'for {{count}} months',
        });
      case 'a':
        return t('forDurationYears', {
          count,
          defaultValue_one: 'for {{count}} year',
          defaultValue_other: 'for {{count}} years',
        });
      default:
        return t('forDurationOther', 'for {{duration}} {{durationUnit}}', {
          duration,
          durationUnit: durationUnit ?? '',
        });
    }
  };
}

const PrescriptionDuration: React.FC<PrescriptionDurationProps> = ({ duration, durationUnit }) => {
  const durationText = usePrescriptionDurationText();
  return <>{durationText(duration, durationUnit)}</>;
};

export default PrescriptionDuration;
