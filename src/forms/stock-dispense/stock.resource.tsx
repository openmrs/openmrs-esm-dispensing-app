import useSWR from 'swr';
import { openmrsFetch, useSession } from '@openmrs/esm-framework';
import { type StockDispenseRequest, type InventoryItem, type MedicationDispense } from '../../types';
import { getUuidFromReference } from '../../utils';

//TODO: Add configuration to retrieve the stock dispense endpoint
// For stock dispense to work, stock management module should be installed and configured
/**
 * Fetches the inventory items for a given drug UUID.
 *
 * @param {string} drugUuid - The UUID of the drug.
 * @returns {Array} - The inventory items.
 */
export const useDispenseStock = (drugUuid: string) => {
  const session = useSession();
  const url = `/ws/rest/v1/stockmanagement/stockiteminventory?v=default&totalCount=true&drugUuid=${drugUuid}&includeBatchNo=true&groupBy=LocationStockItemBatchNo&dispenseLocationUuid=${session?.sessionLocation?.uuid}&includeStrength=1&includeConceptRefIds=1&emptyBatch=1&emptyBatchLocationUuid=${session?.sessionLocation?.uuid}&dispenseAtLocation=1`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<InventoryItem> } }>(url, openmrsFetch);
  return { inventoryItems: data?.data?.results ?? [], error, isLoading };
};

/**
 * Sends a POST request to the inventory dispense endpoint with the provided stock dispense request.
 *
 * @param {AbortController} abortController - The AbortController used to cancel the request.
 * @returns {Promise<Response>} - A Promise that resolves to the response of the POST request.
 */
export async function sendStockDispenseRequest(
  stockDispenseRequest,
  abortController: AbortController,
): Promise<Response> {
  const url = '/ws/rest/v1/stockmanagement/dispenserequest';
  return await openmrsFetch(url, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dispenseItems: [stockDispenseRequest] }),
  });
}

/**
 * Creates a stock dispense request payload.
 *
 * @param inventoryItem - The inventory item to dispense.
 * @param patientUuid - The UUID of the patient.
 * @param encounterUuid - The UUID of the encounter.
 * @param medicationDispensePayload - The medication dispense payload.
 * @returns The stock dispense request payload.
 */
export const createStockDispenseRequestPayload = (
  inventoryItem: InventoryItem,
  patientUuid: string,
  encounterUuid: string,
  medicationDispensePayload: MedicationDispense,
): StockDispenseRequest => {
  return {
    dispenseLocation: inventoryItem.locationUuid,
    patient: patientUuid,
    order: getUuidFromReference(medicationDispensePayload.authorizingPrescription[0].reference),
    encounter: encounterUuid,
    stockItem: inventoryItem?.stockItemUuid,
    stockBatch: inventoryItem.stockBatchUuid,
    stockItemPackagingUOM: inventoryItem.quantityUoMUuid,
    quantity: medicationDispensePayload.quantity.value,
  };
};
