import React from 'react';
import { ComboBox, InlineLoading, InlineNotification, Layer } from '@carbon/react';
import { type MedicationDispense, type InventoryItem } from '../../types';
import { useDispenseStock } from './stock.resource';
import { formatDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

type StockDispenseProps = {
  medicationDispense: MedicationDispense;
  updateInventoryItem: (inventoryItem: InventoryItem) => void;
  inventoryItem: InventoryItem;
};

const StockDispense: React.FC<StockDispenseProps> = ({ medicationDispense, updateInventoryItem }) => {
  const { t } = useTranslation();
  const drugUuid = medicationDispense?.medicationReference?.reference?.split('/')[1];
  const { inventoryItems, error, isLoading } = useDispenseStock(drugUuid);
  const validInventoryItems = inventoryItems.filter((item) => isValidBatch(medicationDispense, item));
  const validInventoryItemss = inventoryItems
    .filter((item) => isValidBatch(medicationDispense, item))
    .sort((a, b) => {
      const dateA = new Date(a.expiration);
      const dateB = new Date(b.expiration);

      return dateA.getDate() - dateB.getDate();
    });

  function parseDate(dateString) {
    return new Date(dateString);
  }

  //check whether the drug will expire before the medication period ends
  function isValidBatch(medicationToDispense, inventoryItem) {
    if (medicationToDispense?.dosageInstruction && medicationToDispense?.dosageInstruction.length > 0) {
      return medicationToDispense.dosageInstruction.some((instruction) => {
        if (
          instruction.timing?.repeat?.duration &&
          instruction.timing?.repeat?.durationUnit &&
          inventoryItem.quantity > 0
        ) {
          const durationUnit = instruction.timing.repeat.durationUnit;
          const durationValue = instruction.timing.repeat.duration;
          const lastMedicationDate = new Date();

          switch (durationUnit) {
            case 's':
              lastMedicationDate.setSeconds(lastMedicationDate.getSeconds() + durationValue);
              break;
            case 'min':
              lastMedicationDate.setMinutes(lastMedicationDate.getMinutes() + durationValue);
              break;
            case 'h':
              lastMedicationDate.setHours(lastMedicationDate.getHours() + durationValue);
              break;
            case 'd':
              lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue);
              break;
            case 'wk':
              lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue * 7);
              break;
            case 'mo':
              lastMedicationDate.setMonth(lastMedicationDate.getMonth() + durationValue);
              break;
            case 'y':
              lastMedicationDate.setFullYear(lastMedicationDate.getFullYear() + durationValue);
              break;
            default:
              return false;
          }

          const expiryDate = parseDate(inventoryItem.expiration);
          return expiryDate > lastMedicationDate;
        }
        return false;
      });
    }
    return false;
  }

  const toStockDispense = (inventoryItems) => {
    return t(
      'stockDispenseDetails',
      'Batch: {{batchNumber}} - Quantity: {{quantity}} ({{quantityUoM}}) - Expiry: {{expiration}}',
      {
        batchNumber: inventoryItems.batchNumber,
        quantity: Math.floor(inventoryItems.quantity),
        quantityUoM: inventoryItems.quantityUoM,
        expiration: formatDate(new Date(inventoryItems.expiration)),
      },
    );
  };

  if (error) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        subtitle={t('errorLoadingInventoryItems', 'Error fetching inventory items')}
        title={t('error', 'Error')}
      />
    );
  }

  if (isLoading) {
    return <InlineLoading description={t('loadingInventoryItems', 'Loading inventory items...')} />;
  }

  return (
    <Layer>
      <ComboBox
        id="stockDispense"
        items={validInventoryItems}
        onChange={({ selectedItem }) => {
          updateInventoryItem(selectedItem);
        }}
        itemToString={(item) => (item ? toStockDispense(item) : '')}
        titleText={t('stockDispense', 'Stock Dispense')}
        placeholder={t('selectStockDispense', 'Select stock to dispense from')}
      />
    </Layer>
  );
};

export default StockDispense;
