import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import PrescriptionDuration from './prescription-duration.component';

describe('PrescriptionDuration', () => {
  beforeAll(async () => {
    await i18next.use(initReactI18next).init({ lng: 'en', resources: {} });
  });

  it.each([
    [5, 'd', 'for 5 days'],
    [1, 'd', 'for 1 day'],
    [1, 'wk', 'for 1 week'],
    [2, 'wk', 'for 2 weeks'],
    [3, 'mo', 'for 3 months'],
    [1, 'a', 'for 1 year'],
    [4, 'h', 'for 4 hours'],
  ])('renders %s %s as "%s", not the FHIR unit code', (duration, unit, expected) => {
    render(<PrescriptionDuration duration={duration} durationUnit={unit} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});

describe('PrescriptionDuration in French', () => {
  beforeAll(async () => {
    await i18next.use(initReactI18next).init({
      lng: 'fr',
      resources: {
        fr: {
          translation: {
            forDurationWeeks_one: 'pendant {{count}} semaine',
            forDurationWeeks_other: 'pendant {{count}} semaines',
          },
        },
      },
    });
  });

  it('uses the singular for 1 and the plural for 2', () => {
    const { unmount } = render(<PrescriptionDuration duration={1} durationUnit="wk" />);
    expect(screen.getByText('pendant 1 semaine')).toBeInTheDocument();
    unmount();
    render(<PrescriptionDuration duration={2} durationUnit="wk" />);
    expect(screen.getByText('pendant 2 semaines')).toBeInTheDocument();
  });
});
