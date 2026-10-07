import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, InlineLoading, InlineNotification, Layer } from '@carbon/react';
import { formatDate, useConfig } from '@openmrs/esm-framework';
import { type MedicationDispense, type InventoryItem } from '../../types';
import { type PharmacyConfig } from '../../config-schema';
import { useDispenseStock } from './stock.resource';
import { isValidBatch } from './stock-dispense.utils';

type StockDispenseProps = {
  medicationDispense: MedicationDispense;
  updateInventoryItem: (inventoryItem: InventoryItem) => void;
  inventoryItem: InventoryItem;
};

const StockDispense: React.FC<StockDispenseProps> = ({ medicationDispense, updateInventoryItem }) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const validateBatch = typeof config === 'undefined' || Boolean(config.validateBatch);

  const drugUuid = medicationDispense?.medicationReference?.reference?.split('/')[1];
  const { inventoryItems, error, isLoading } = useDispenseStock(drugUuid);

  const validInventoryItems = inventoryItems
    .filter((item) => isValidBatch(medicationDispense, item, validateBatch))
    .sort((a, b) => new Date(a.expiration).getTime() - new Date(b.expiration).getTime());

  const toStockDispense = (item: InventoryItem) =>
    t(
      'stockDispenseDetails',
      'Batch: {{batchNumber}} - Quantity: {{quantity}} ({{quantityUoM}}) - Expiry: {{expiration}}',
      {
        batchNumber: item.batchNumber,
        quantity: Math.floor(item.quantity),
        quantityUoM: item.quantityUoM,
        expiration: formatDate(new Date(item.expiration)),
      },
    );

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
