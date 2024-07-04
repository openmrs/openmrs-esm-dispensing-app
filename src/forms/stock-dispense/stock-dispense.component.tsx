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
  updateAvailableQuantity: (inventoryItem: InventoryItem) => void;
};

const StockDispense: React.FC<StockDispenseProps> = ({
  medicationDispense,
  updateInventoryItem,
  updateAvailableQuantity,
}) => {
  const { t } = useTranslation();
  const drugUuid = medicationDispense?.medicationReference?.reference?.split('/')[1];
  const { inventoryItems, error, isLoading } = useDispenseStock(drugUuid);
  // const filteredInventoryItems = inventoryItems.filter((item) => item.quantity > 0);
  const nonExpiringInventoryItems = inventoryItems.filter((item) => isValidBatch(medicationDispense, item));

  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  function parseDate(dateString) {
    return new Date(dateString);
  }

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
          let lastMedicationDate = new Date();

          switch (durationUnit) {
            case 's':
            case 'min':
            case 'h':
              lastMedicationDate = new Date();
              break;
            case 'd':
              lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue);
              break;
            case 'wk':
              lastMedicationDate.setDate(lastMedicationDate.getDate() + durationValue * 7);
              break;
            case 'mo': {
              let currentMonth = lastMedicationDate.getMonth() + 1;
              let currentYear = lastMedicationDate.getFullYear();
              let totalDays = 0;

              for (let i = 0; i < durationValue; i++) {
                if (currentMonth > 12) {
                  currentMonth = currentMonth % 12;
                  currentYear++;
                }
                totalDays += daysInMonth(currentMonth, currentYear);
                currentMonth++;
              }
              lastMedicationDate.setDate(lastMedicationDate.getDate() + totalDays);
              break;
            }
            case 'y': {
              for (let i = 0; i < durationValue; i++) {
                for (let j = 1; j <= 12; j++) {
                  lastMedicationDate.setDate(
                    lastMedicationDate.getDate() + daysInMonth(j, lastMedicationDate.getFullYear()),
                  );
                }
                lastMedicationDate.setFullYear(lastMedicationDate.getFullYear() + 1);
              }
              break;
            }
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
        items={nonExpiringInventoryItems}
        onChange={({ selectedItem }) => {
          updateInventoryItem(selectedItem);
          updateAvailableQuantity(selectedItem);
        }}
        itemToString={(item) => (item ? toStockDispense(item) : '')}
        titleText={t('stockDispense', 'Stock Dispense')}
        placeholder={t('selectStockDispense', 'Select stock to dispense from')}
      />
    </Layer>
  );
};

export default StockDispense;
