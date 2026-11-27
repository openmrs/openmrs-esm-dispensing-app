import dayjs from 'dayjs';
import { describe, expect, test } from 'vitest';
import {
  type MedicationDispense,
  MedicationDispenseStatus,
  type MedicationRequest,
  type MedicationRequestBundle,
  MedicationRequestFulfillerStatus,
  MedicationRequestStatus,
} from './types';
import { OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS } from './constants';
import { isBundleDeclined, isBundleDispensable, isBundlePickable } from './utils';
import {
  formatNaira,
  type PharmacyBillLine,
  prescriptionTotal,
  unbilledOrders,
} from './medication-request/pharmacy-bill.resource';
import { remainingPageOffsets } from './medication-request/medication-request.resource';
import { stageDateParams, todayRange } from './prescriptions/stage-date-range';

const request = (id: string, fulfillerStatus?: MedicationRequestFulfillerStatus, status = MedicationRequestStatus.active) =>
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

const bundle = (req: MedicationRequest, dispenses: Array<MedicationDispense> = []) =>
  ({ request: req, dispenses }) as MedicationRequestBundle;

const line = (order: string, total: number | null, priced = true, billed: string | null = null): PharmacyBillLine => ({
  order,
  drug: order,
  quantity: 1,
  unitPrice: total,
  total,
  priced,
  billed,
});

describe('Pick Order: which drugs move to Picked', () => {
  test('a newly ordered drug is picked', () => {
    expect(isBundlePickable(bundle(request('a')), 90)).toBe(true);
  });

  test('a drug already picked, dispensed or declined is not picked again', () => {
    expect(isBundlePickable(bundle(request('a', MedicationRequestFulfillerStatus.in_progress)), 90)).toBe(false);
    expect(isBundlePickable(bundle(request('a'), [dispense('a', MedicationDispenseStatus.completed)]), 90)).toBe(false);
    expect(isBundlePickable(bundle(request('a'), [dispense('a', MedicationDispenseStatus.declined)]), 90)).toBe(false);
  });

  test('a cancelled or stopped order is not picked', () => {
    expect(isBundlePickable(bundle(request('a', undefined, MedicationRequestStatus.cancelled)), 90)).toBe(false);
  });
});

describe('Dispense Drugs: which drugs are dispensed', () => {
  test('a picked drug is dispensed', () => {
    expect(isBundleDispensable(bundle(request('a', MedicationRequestFulfillerStatus.in_progress)), 90)).toBe(true);
  });

  test('a drug that was not picked, or was declined, or is already dispensed, is not', () => {
    expect(isBundleDispensable(bundle(request('a')), 90)).toBe(false);
    expect(
      isBundleDispensable(
        bundle(request('a', MedicationRequestFulfillerStatus.in_progress), [dispense('a', MedicationDispenseStatus.declined)]),
        90,
      ),
    ).toBe(false);
    expect(
      isBundleDispensable(
        bundle(request('a', MedicationRequestFulfillerStatus.in_progress), [
          dispense('a', MedicationDispenseStatus.completed),
        ]),
        90,
      ),
    ).toBe(false);
    expect(isBundleDispensable(bundle(request('a', MedicationRequestFulfillerStatus.completed)), 90)).toBe(false);
  });

  test('in a mixed prescription, only the picked drugs are dispensed', () => {
    const bundles = [
      bundle(request('picked1', MedicationRequestFulfillerStatus.in_progress)),
      bundle(request('picked2', MedicationRequestFulfillerStatus.in_progress)),
      bundle(request('declined', MedicationRequestFulfillerStatus.declined)),
      bundle(request('new')),
    ];
    expect(bundles.filter((b) => isBundleDispensable(b, 90)).map((b) => b.request.id)).toEqual(['picked1', 'picked2']);
    expect(bundles.filter((b) => isBundlePickable(b, 90)).map((b) => b.request.id)).toEqual(['new']);
  });
});

describe('Prices', () => {
  test('the total adds the priced drugs and leaves out declined and unpriced ones', () => {
    const bundles = [
      bundle(request('act')),
      bundle(request('pcm')),
      bundle(request('declined'), [dispense('declined', MedicationDispenseStatus.declined)]),
      bundle(request('noprice')),
    ];
    const lines = {
      act: line('act', 8400),
      pcm: line('pcm', 150),
      declined: line('declined', 999),
      noprice: line('noprice', null, false),
    };
    expect(prescriptionTotal(bundles, lines)).toBe(8550);
    expect(isBundleDeclined(bundles[2])).toBe(true);
  });

  test('only priced, not yet billed drugs go on the bill', () => {
    const lines = { a: line('a', 100), b: line('b', 100, true, '0191-7'), c: line('c', null, false) };
    expect(unbilledOrders(['a', 'b', 'c', 'missing'], lines)).toEqual(['a']);
  });

  test('amounts show in naira with two decimals', () => {
    expect(formatNaira(8400)).toMatch(/^₦8,400\.00$/);
    expect(formatNaira(null)).toMatch(/^₦0\.00$/);
  });
});

describe('Loading only the chosen period', () => {
  test('pages after the first are listed for parallel loading, up to the cap', () => {
    expect(remainingPageOffsets(15)).toEqual([]);
    expect(remainingPageOffsets(45)).toEqual([20, 40]);
    expect(remainingPageOffsets(10000, 20, 100)).toEqual([20, 40, 60, 80]);
  });

  test('today is the default period, from the start of today to the start of tomorrow', () => {
    const range = todayRange(new Date('2026-11-16T14:30:00Z'));
    expect(stageDateParams(range)).toBe('&date=ge2026-11-16T00:00:00.000Z&date=lt2026-11-17T00:00:00.000Z');
  });

  test('a range covers whole days, both ends included', () => {
    const params = stageDateParams({ start: new Date('2026-11-10T09:00:00Z'), end: new Date('2026-11-12T18:00:00Z') });
    expect(params).toBe('&date=ge2026-11-10T00:00:00.000Z&date=lt2026-11-13T00:00:00.000Z');
  });
});
