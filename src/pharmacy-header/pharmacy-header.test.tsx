import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { PharmacyHeader } from './pharmacy-header.component';

const mockUseConfig = vi.mocked(useConfig);
const mockUseSession = vi.mocked(useSession);

describe('PharmacyHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 2, 9, 15));
    mockUseConfig.mockReturnValue({ appName: 'Dispensary' });
    mockUseSession.mockReturnValue({ sessionLocation: { display: 'Outpatient Pharmacy' } } as ReturnType<
      typeof useSession
    >);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the configured app name as the page title', () => {
    render(<PharmacyHeader />);

    expect(screen.getByText('Dispensary')).toBeInTheDocument();
  });

  it('shows the session location and the current date', () => {
    render(<PharmacyHeader />);

    expect(screen.getByText('Outpatient Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('02-Oct-2026, 09:15 AM')).toBeInTheDocument();
  });
});
