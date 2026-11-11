import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { PRESCRIPTION_ACTIONS_FOOTER_SLOT } from '../constants';
import type { MedicationRequestBundle } from '../types';
import PrescriptionsActionsFooter from './prescription-actions.component';

const mockedExtensionSlot = vi.mocked(ExtensionSlot);

const patientUuid = '558494fe-5850-4b34-a3bf-06550334ba4a';
const encounterUuid = '7aee7123-9e50-4f72-a636-895d77a63e98';
const medicationRequestBundles = [
  { request: { id: 'request-1' }, dispenses: [] },
] as unknown as Array<MedicationRequestBundle>;

describe('PrescriptionsActionsFooter', () => {
  beforeEach(() => {
    mockedExtensionSlot.mockClear();
    mockedExtensionSlot.mockImplementation(() => null);
  });

  test('renders the footer slot with the prescription state', () => {
    render(
      <PrescriptionsActionsFooter
        encounterUuid={encounterUuid}
        patientUuid={patientUuid}
        medicationRequestBundles={medicationRequestBundles}
      />,
    );

    expect(mockedExtensionSlot).toHaveBeenCalledWith(
      expect.objectContaining({
        name: PRESCRIPTION_ACTIONS_FOOTER_SLOT,
        state: { encounterUuid, patientUuid, medicationRequestBundles },
      }),
      expect.anything(),
    );
  });
});
