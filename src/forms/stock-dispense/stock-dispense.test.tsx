import React from 'react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import { type InventoryItem, type MedicationDispense } from '../../types';
import { useDispenseStock } from './stock.resource';
import StockDispense from './stock-dispense.component';

vi.mock('./stock.resource', () => ({
  useDispenseStock: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig);
const mockUseDispenseStock = vi.mocked(useDispenseStock);

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY).toISOString();

const batch = (overrides: Partial<InventoryItem> = {}) =>
  ({
    stockBatchUuid: 'batch-001',
    batchNumber: 'BATCH-001',
    quantity: 80,
    quantityUoM: 'Tablet',
    expiration: daysFromNow(365),
    ...overrides,
  }) as InventoryItem;

const placeholderRow = () => batch({ stockBatchUuid: null, batchNumber: null, quantity: 0, expiration: null });

const medicationDispense = (repeat?: { duration: number; durationUnit: string }) =>
  ({
    medicationReference: { reference: 'Medication/drug-uuid' },
    dosageInstruction: repeat ? [{ timing: { repeat } }] : [],
  }) as unknown as MedicationDispense;

const renderStockDispense = (
  items: Array<InventoryItem>,
  md: MedicationDispense = medicationDispense(),
  validateBatch = true,
) => {
  mockUseConfig.mockReturnValue({ validateBatch });
  mockUseDispenseStock.mockReturnValue({ inventoryItems: items, error: undefined, isLoading: false });
  render(<StockDispense medicationDispense={md} updateInventoryItem={vi.fn()} inventoryItem={undefined} />);
};

const openBatchOptions = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));
  return screen.queryAllByRole('option');
};

describe('StockDispense', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('offers an unexpired, in-stock batch when the prescription has no duration', async () => {
    renderStockDispense([batch()]);

    expect(await openBatchOptions()).toHaveLength(1);
  });

  test('does not offer a batch that expires during treatment', async () => {
    renderStockDispense(
      [batch({ expiration: daysFromNow(3) })],
      medicationDispense({ duration: 5, durationUnit: 'd' }),
    );

    expect(await openBatchOptions()).toHaveLength(0);
  });
});
