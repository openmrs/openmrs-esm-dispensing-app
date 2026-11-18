/* eslint-disable testing-library/no-node-access --
   react-to-print prints from an iframe outside the rendered tree, so these tests read that iframe's DOM directly */
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from '@openmrs/esm-framework';
import { useReactToPrint } from 'react-to-print';
import type * as ReactToPrint from 'react-to-print';
import { usePrescriptionDetails } from '../medication-request/medication-request.resource';
import type { MedicationRequestBundle } from '../types';
import PrescriptionPrintPreviewModal from './prescription-print-preview.modal';

vi.mock('../medication-request/medication-request.resource');

// Wrap the real hook in a spy so printing still runs through react-to-print while
// the options it receives stay inspectable.
vi.mock('react-to-print', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactToPrint>();
  return { ...actual, useReactToPrint: vi.fn(actual.useReactToPrint) };
});

const mockUsePrescriptionDetails = vi.mocked(usePrescriptionDetails);
const mockUseSession = vi.mocked(useSession);
const mockUseReactToPrint = vi.mocked(useReactToPrint);

function buildBundle(id: string, medication: string, dose: number): MedicationRequestBundle {
  return {
    request: {
      resourceType: 'MedicationRequest',
      id,
      status: 'active',
      intent: 'order',
      priority: 'routine',
      authoredOn: '2026-11-01T09:00:00+00:00',
      subject: { reference: 'Patient/patient-uuid', type: 'Patient', display: 'Jane Doe (OpenMRS ID: 100008E)' },
      requester: { reference: 'Practitioner/p1', type: 'Practitioner', display: 'Dr Super User (Identifier: admin)' },
      medicationReference: { reference: `Medication/${id}`, type: 'Medication', display: medication },
      dispenseRequest: {
        numberOfRepeatsAllowed: 2,
        quantity: { value: 30, unit: 'Tablet', code: 'tablet-uuid' },
        validityPeriod: { start: '2026-11-01T09:00:00+00:00' },
      },
      dosageInstruction: [
        {
          text: 'Take after meals',
          timing: { code: { text: 'Twice daily' }, repeat: { duration: 5, durationUnit: 'd' } },
          route: { text: 'Oral' },
          doseAndRate: [{ doseQuantity: { value: dose, unit: 'mg' } }],
        },
      ],
    },
    dispenses: [],
  } as unknown as MedicationRequestBundle;
}

const bundles = [buildBundle('request-1', 'Aspirin 81mg', 81), buildBundle('request-2', 'Paracetamol 500mg', 500)];

const printSpy = vi.fn();
let printedPage: HTMLElement | null = null;
const originalAppendChild = document.body.appendChild;

function renderModal() {
  return render(
    <PrescriptionPrintPreviewModal
      onClose={vi.fn()}
      encounterUuid="encounter-uuid"
      patientUuid="patient-uuid"
      status="active"
    />,
  );
}

function latestPrintOptions() {
  return mockUseReactToPrint.mock.calls.at(-1)[0];
}

describe('PrescriptionPrintPreviewModal', () => {
  beforeEach(() => {
    mockUsePrescriptionDetails.mockReturnValue({
      medicationRequestBundles: bundles,
      prescriptionDate: new Date('2026-11-01'),
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
    mockUseSession.mockReturnValue({
      authenticated: true,
      sessionId: 'session-id',
      sessionLocation: { uuid: 'location-uuid', display: 'Outpatient Clinic' },
    } as ReturnType<typeof useSession>);

    // Snapshot the print iframe when print() is called, since react-to-print may remove it afterwards.
    printedPage = null;
    printSpy.mockImplementation(() => {
      const iframe = document.getElementById('printWindow') as HTMLIFrameElement;
      printedPage = iframe.contentDocument.documentElement.cloneNode(true) as HTMLElement;
    });

    // jsdom implements neither window.print nor window.focus, so stub them on the print iframe
    // that react-to-print creates.
    vi.spyOn(document.body, 'appendChild').mockImplementation(function <T extends Node>(this: HTMLElement, node: T) {
      const result = originalAppendChild.call(this, node) as T;
      if (node instanceof HTMLIFrameElement && node.id === 'printWindow') {
        const stubWindow = () => {
          node.contentWindow.print = printSpy;
          node.contentWindow.focus = vi.fn();
        };
        stubWindow();
        node.addEventListener('load', stubWindow);
      }
      return result;
    });

    const style = document.createElement('style');
    style.id = 'host-styles';
    style.textContent = '.host-style-marker { color: rgb(1, 2, 3); }';
    document.head.appendChild(style);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById('host-styles')?.remove();
    document.getElementById('printWindow')?.remove();
  });

  test('prints the prescription printout through a print iframe', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /^print$/i }));

    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1), { timeout: 3000 });

    const printedText = printedPage.querySelector('body').textContent;
    expect(printedText).toContain('Prescription instructions');
    expect(printedText).toContain('Jane Doe');
    expect(printedText).toContain('Aspirin 81mg');
    expect(printedText).toContain('Paracetamol 500mg');
    expect(printedText).toContain('Take after meals');
    expect(printedText).toContain('Prescribed By: Dr Super User');
    expect(printedText).toContain('Outpatient Clinic');
    // The selector checkboxes and modal chrome are not part of the printout
    expect(printedText).not.toContain('Check prescriptions to print');
    expect(printedPage.querySelector('input[type="checkbox"]')).toBeNull();
  });

  test('copies the page styles into the print iframe', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /^print$/i }));

    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1), { timeout: 3000 });

    const copiedStyles = Array.from(printedPage.querySelectorAll('head style'))
      .map((style) => style.textContent)
      .join('\n');
    expect(copiedStyles).toContain('.host-style-marker');
  });

  test('leaves deselected prescriptions out of the printout', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('checkbox', { name: /paracetamol 500mg/i }));
    await user.click(screen.getByRole('button', { name: /^print$/i }));

    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1), { timeout: 3000 });

    const printedText = printedPage.querySelector('body').textContent;
    expect(printedText).toContain('Aspirin 81mg');
    expect(printedText).not.toContain('Paracetamol 500mg');
  });

  test('can print again after a print finishes', async () => {
    const user = userEvent.setup();
    renderModal();

    const printButton = screen.getByRole('button', { name: /^print$/i });
    await user.click(printButton);
    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1), { timeout: 3000 });

    expect(printButton).toBeEnabled();
    await user.click(screen.getByRole('checkbox', { name: /aspirin 81mg/i }));
    await user.click(printButton);
    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(2), { timeout: 3000 });

    expect(document.querySelectorAll('#printWindow').length).toBeLessThanOrEqual(1);
    const printedText = printedPage.querySelector('body').textContent;
    expect(printedText).not.toContain('Aspirin 81mg');
    expect(printedText).toContain('Paracetamol 500mg');
  });

  test('shows a print error and clears it when printing again', async () => {
    const user = userEvent.setup();
    renderModal();

    // react-to-print only reports errors from its own callbacks or a custom print function,
    // neither of which this modal can trigger, so call the handler it was given.
    act(() => latestPrintOptions().onPrintError('print', new Error('Printer unavailable')));

    expect(screen.getByText('Print Error')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while printing. Please try again.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^print$/i }));

    await waitFor(() => expect(screen.queryByText('Print Error')).not.toBeInTheDocument());
    await waitFor(() => expect(printSpy).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });

  test('disables the print button while prescriptions load', () => {
    mockUsePrescriptionDetails.mockReturnValue({
      medicationRequestBundles: [],
      prescriptionDate: null,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderModal();

    expect(screen.getByRole('button', { name: /^print$/i })).toBeDisabled();
  });
});
