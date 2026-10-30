import { describe, expect, test } from 'vitest';
import { type InventoryItem, type MedicationDispense } from '../../types';
import { isUnexpired, isValidBatch } from './stock-dispense.utils';

const now = new Date('2026-09-30T10:00:00.000Z');

const inventoryItem = (overrides: Partial<InventoryItem> = {}) =>
  ({
    stockBatchUuid: 'batch-001',
    batchNumber: 'BATCH-001',
    quantity: 10,
    quantityUoM: 'tablets',
    expiration: '2026-12-31T23:59:59.000Z',
    ...overrides,
  }) as InventoryItem;

type Repeat = { duration?: number; durationUnit?: string };

const medication = (...repeats: Array<Repeat>) =>
  ({
    dosageInstruction: repeats.map((repeat) => ({ timing: { repeat } })),
  }) as unknown as MedicationDispense;

describe('isUnexpired', () => {
  test('returns true when expiry is after the reference date', () => {
    expect(isUnexpired(inventoryItem({ expiration: '2026-10-01T10:00:00.000Z' }), now)).toBe(true);
  });

  test('returns false when expiry is before the reference date', () => {
    expect(isUnexpired(inventoryItem({ expiration: '2026-09-29T10:00:00.000Z' }), now)).toBe(false);
  });

  test('returns false when expiry equals the reference date', () => {
    expect(isUnexpired(inventoryItem({ expiration: now.toISOString() }), now)).toBe(false);
  });
});

describe('isValidBatch', () => {
  describe('prescription without duration (O3-6021)', () => {
    test('allows an unexpired batch with available stock', () => {
      expect(isValidBatch(medication(), inventoryItem({ expiration: '2026-10-01T10:00:00.000Z' }), true, now)).toBe(
        true,
      );
    });

    test('rejects an expired batch', () => {
      expect(isValidBatch(medication(), inventoryItem({ expiration: '2026-09-29T10:00:00.000Z' }), true, now)).toBe(
        false,
      );
    });

    test('rejects a batch with no available stock', () => {
      expect(isValidBatch(medication(), inventoryItem({ quantity: 0 }), true, now)).toBe(false);
    });

    test('treats a missing dosageInstruction as no duration', () => {
      expect(isValidBatch({} as MedicationDispense, inventoryItem(), true, now)).toBe(true);
    });

    test('treats an instruction without a duration unit as no duration', () => {
      expect(
        isValidBatch(
          medication({ duration: 30 }),
          inventoryItem({ expiration: '2026-10-01T10:00:00.000Z' }),
          true,
          now,
        ),
      ).toBe(true);
    });

    test('treats an instruction without a duration value as no duration', () => {
      expect(
        isValidBatch(
          medication({ durationUnit: 'd' }),
          inventoryItem({ expiration: '2026-10-01T10:00:00.000Z' }),
          true,
          now,
        ),
      ).toBe(true);
    });
  });

  describe('prescription with duration', () => {
    test('allows a batch that outlasts the treatment period', () => {
      expect(
        isValidBatch(
          medication({ duration: 30, durationUnit: 'd' }),
          inventoryItem({ expiration: '2026-11-01T10:00:00.000Z' }),
          true,
          now,
        ),
      ).toBe(true);
    });

    test('rejects a batch that expires before treatment ends', () => {
      expect(
        isValidBatch(
          medication({ duration: 30, durationUnit: 'd' }),
          inventoryItem({ expiration: '2026-10-15T10:00:00.000Z' }),
          true,
          now,
        ),
      ).toBe(false);
    });

    test('rejects a batch with no available stock', () => {
      expect(
        isValidBatch(medication({ duration: 30, durationUnit: 'd' }), inventoryItem({ quantity: 0 }), true, now),
      ).toBe(false);
    });

    test.each([
      ['s', 30, '2026-09-30T10:00:10.000Z', '2026-09-30T10:01:00.000Z'],
      ['min', 30, '2026-09-30T10:10:00.000Z', '2026-09-30T11:00:00.000Z'],
      ['h', 12, '2026-09-30T20:00:00.000Z', '2026-10-01T00:00:00.000Z'],
      ['d', 7, '2026-10-05T10:00:00.000Z', '2026-10-08T10:00:00.000Z'],
      ['wk', 2, '2026-10-10T10:00:00.000Z', '2026-10-15T10:00:00.000Z'],
      ['mo', 3, '2026-12-01T10:00:00.000Z', '2027-01-15T10:00:00.000Z'],
      ['y', 1, '2027-06-30T10:00:00.000Z', '2027-12-31T10:00:00.000Z'],
    ])('applies the "%s" unit to the treatment period', (durationUnit, duration, expiresDuring, expiresAfter) => {
      const md = medication({ duration, durationUnit });

      expect(isValidBatch(md, inventoryItem({ expiration: expiresDuring }), true, now)).toBe(false);
      expect(isValidBatch(md, inventoryItem({ expiration: expiresAfter }), true, now)).toBe(true);
    });

    test('rejects unsupported duration units', () => {
      expect(isValidBatch(medication({ duration: 30, durationUnit: 'fortnight' }), inventoryItem(), true, now)).toBe(
        false,
      );
    });

    test('allows the batch when any instruction is satisfied', () => {
      const md = medication({ duration: 30, durationUnit: 'fortnight' }, { duration: 7, durationUnit: 'd' });

      expect(isValidBatch(md, inventoryItem({ expiration: '2026-10-15T10:00:00.000Z' }), true, now)).toBe(true);
    });
  });

  describe('batch validation disabled', () => {
    test('accepts every item without checking stock or expiry', () => {
      expect(
        isValidBatch(
          medication({ duration: 30, durationUnit: 'd' }),
          inventoryItem({ quantity: 0, expiration: '2020-01-01T00:00:00.000Z' }),
          false,
          now,
        ),
      ).toBe(true);
    });
  });
});
