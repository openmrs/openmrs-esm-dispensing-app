import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import PrescriptionPrintAction from './prescription-print-action.extension';

const mockedUseConfig = vi.mocked(useConfig);

describe('PrescriptionPrintAction', () => {
  test('renders the print button when the print prescriptions button is enabled', () => {
    mockedUseConfig.mockReturnValue({ actionButtons: { printPrescriptionsButton: { enabled: true } } });

    render(<PrescriptionPrintAction encounterUuid="encounter-uuid" patientUuid="patient-uuid" />);

    expect(screen.getByRole('button', { name: /print prescriptions/i })).toBeInTheDocument();
  });

  test('renders nothing when the print prescriptions button is disabled', () => {
    mockedUseConfig.mockReturnValue({ actionButtons: { printPrescriptionsButton: { enabled: false } } });

    render(<PrescriptionPrintAction encounterUuid="encounter-uuid" patientUuid="patient-uuid" />);

    expect(screen.queryByRole('button', { name: /print prescriptions/i })).not.toBeInTheDocument();
  });
});
