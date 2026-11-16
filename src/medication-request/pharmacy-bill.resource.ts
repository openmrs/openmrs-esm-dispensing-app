import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type MedicationRequestBundle } from '../types';
import { isBundleDeclined } from '../utils';

/**
 * Drug prices of a prescription, from the MediHealth billing module's pharmacy bill API: one line per
 * drug order with the quantity, the unit price from billing and the total, and whether it is billed.
 */
export interface PharmacyBillLine {
  order: string;
  orderNumber?: string;
  drug: string;
  quantity: number;
  quantityUnits?: string;
  unitPrice: number | null;
  total: number | null;
  priced: boolean;
  billed: string | null;
}

export interface PharmacyBill {
  encounter: string;
  lines: Array<PharmacyBillLine>;
  unbilledTotal: number;
}

export function pharmacyBillUrl(encounterUuid: string) {
  return `${restBaseUrl}/billing/api/pharmacy-bill?encounter=${encounterUuid}`;
}

export function usePharmacyBill(encounterUuid: string) {
  const { data, error, isLoading, mutate } = useSWR<{ data: PharmacyBill }, Error>(
    encounterUuid ? pharmacyBillUrl(encounterUuid) : null,
    openmrsFetch,
  );
  const linesByOrder: Record<string, PharmacyBillLine> = {};
  (data?.data?.lines ?? []).forEach((line) => (linesByOrder[line.order] = line));
  return { linesByOrder, error, isLoading, mutate };
}

/** Creates one pending bill for the given drug orders and sends it to the cashier. */
export function generatePharmacyBill(encounterUuid: string, orderUuids: Array<string>) {
  return openmrsFetch<{ receiptNumber: string; total: number; cashPoint?: string }>(
    `${restBaseUrl}/billing/api/pharmacy-bill`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { encounter: encounterUuid, orders: orderUuids },
    },
  );
}

export function formatNaira(amount: number | null | undefined): string {
  return (
    '₦' +
    Number(amount ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/** Total of the prescription's priced drugs, leaving out the declined ones. */
export function prescriptionTotal(
  bundles: Array<MedicationRequestBundle>,
  linesByOrder: Record<string, PharmacyBillLine>,
): number {
  return (bundles ?? [])
    .filter((bundle) => !isBundleDeclined(bundle))
    .reduce((sum, bundle) => {
      const line = linesByOrder[bundle.request.id];
      return sum + (line?.priced ? Number(line.total ?? 0) : 0);
    }, 0);
}

/** Orders that can still go on a bill: priced and not billed yet. */
export function unbilledOrders(orderUuids: Array<string>, linesByOrder: Record<string, PharmacyBillLine>) {
  return orderUuids.filter((uuid) => linesByOrder[uuid]?.priced && !linesByOrder[uuid]?.billed);
}
