import React from 'react';
import { ComboBox, InlineLoading, InlineNotification, Layer } from '@carbon/react';
import { type MedicationDispense, type InventoryItem } from '../../types';
import { useDispenseStock } from './useDispenseStock';
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
        items={inventoryItems}
        onChange={({ selectedItem }) => updateInventoryItem(selectedItem)}
        itemToString={(item) => (item ? toStockDispense(item) : '')}
        titleText={t('stockDispense', 'Stock Dispense')}
        placeholder={t('selectStockDispense', 'Select stock to dispense from')}
      />
    </Layer>
  );
};

export default StockDispense;
