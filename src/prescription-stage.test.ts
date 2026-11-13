import dayjs from 'dayjs';
import { describe, expect, test } from 'vitest';
import {
  type MedicationDispense,
  MedicationDispenseStatus,
  type MedicationRequest,
  MedicationRequestFulfillerStatus,
  MedicationRequestStatus,
} from './types';
import { OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS } from './constants';
import { computePrescriptionStage, computePrescriptionStatusMessageCode, isMedicationRequestPicked } from './utils';

const request = (
  id: string,
  fulfillerStatus?: MedicationRequestFulfillerStatus,
  status = MedicationRequestStatus.active,
) =>
  ({
    resourceType: 'MedicationRequest',
    id,
    status,
    extension: fulfillerStatus ? [{ url: OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS, valueCode: fulfillerStatus }] : [],
    dispenseRequest: { validityPeriod: { start: dayjs().subtract(1, 'day').toISOString() } },
  }) as unknown as MedicationRequest;

const dispense = (requestId: string, status: MedicationDispenseStatus) =>
  ({
    resourceType: 'MedicationDispense',
    status,
    authorizingPrescription: [{ reference: 'MedicationRequest/' + requestId }],
  }) as unknown as MedicationDispense;

describe('lab-style prescription stages', () => {
  test('a new prescription is Ordered', () => {
    expect(computePrescriptionStage([request('a')], [], 90)).toBe('ordered');
  });

  test('a picked prescription is Picked, and its status reads "picked"', () => {
    const picked = request('a', MedicationRequestFulfillerStatus.in_progress);
    expect(computePrescriptionStage([picked], [], 90)).toBe('picked');
    expect(computePrescriptionStatusMessageCode([picked], 90)).toBe('picked');
    expect(isMedicationRequestPicked(picked)).toBe(true);
  });

  test('a paused prescription stays with the pharmacy (Picked)', () => {
    expect(computePrescriptionStage([request('a', MedicationRequestFulfillerStatus.on_hold)], [], 90)).toBe('picked');
  });

  test('a dispensed prescription is Dispensed, even after its fulfiller status is cleared', () => {
    expect(computePrescriptionStage([request('a')], [dispense('a', MedicationDispenseStatus.completed)], 90)).toBe(
      'dispensed',
    );
  });

  test('a prescription with one drug dispensed and one still open is Picked', () => {
    const stage = computePrescriptionStage(
      [request('a'), request('b')],
      [dispense('a', MedicationDispenseStatus.completed)],
      90,
    );
    expect(stage).toBe('picked');
  });

  test('a prescription whose drugs were all declined is Declined', () => {
    expect(computePrescriptionStage([request('a', MedicationRequestFulfillerStatus.declined)], [], 90)).toBe(
      'declined',
    );
  });

  test('one drug dispensed and the other declined counts as Dispensed', () => {
    const stage = computePrescriptionStage(
      [request('a'), request('b', MedicationRequestFulfillerStatus.declined)],
      [dispense('a', MedicationDispenseStatus.completed)],
      90,
    );
    expect(stage).toBe('dispensed');
  });

  test('a prescription that expired without being dispensed has no stage', () => {
    const old = {
      ...request('a'),
      dispenseRequest: { validityPeriod: { start: dayjs().subtract(200, 'day').toISOString() } },
    } as MedicationRequest;
    expect(computePrescriptionStage([old], [], 90)).toBeNull();
  });
});
