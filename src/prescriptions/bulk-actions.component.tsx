import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Button, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import { type MedicationRequestBundle, MedicationDispenseStatus, MedicationRequestFulfillerStatus } from '../types';
import { isBundleDispensable, isBundlePickable, markEncounterAsStale, revalidate } from '../utils';
import {
  updateMedicationRequestFulfillerStatus,
  updateOrderFulfillerDetails,
} from '../medication-request/medication-request.resource';
import {
  initiateMedicationDispenseBody,
  saveMedicationDispense,
  useProviders,
} from '../medication-dispense/medication-dispense.resource';
import {
  formatNaira,
  generatePharmacyBill,
  type PharmacyBillLine,
  prescriptionTotal,
  unbilledOrders,
} from '../medication-request/pharmacy-bill.resource';
import styles from './bulk-actions.scss';

interface BulkActionsProps {
  encounterUuid: string;
  bundles: Array<MedicationRequestBundle>;
  linesByOrder: Record<string, PharmacyBillLine>;
  pricesAvailable: boolean;
  onBillChanged: () => void;
  disabled: boolean;
}

/**
 * MediHealth bulk workflow for a whole prescription. Declined drugs are left out.
 * - Pick Order: every ordered drug moves to Picked in one click.
 * - Dispense Drugs: every picked drug is dispensed in one click (moving to Dispensed), and one bill is
 *   sent to the cashier for the dispensed drugs that have a price.
 */
const BulkActions: React.FC<BulkActionsProps> = ({
  encounterUuid,
  bundles,
  linesByOrder,
  pricesAvailable,
  onBillChanged,
  disabled,
}) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);
  const { mutate } = useSWRConfig();
  const [busy, setBusy] = useState<'' | 'pick' | 'dispense'>('');

  const days = config.medicationRequestExpirationPeriodInDays;
  const toPick = bundles.filter((bundle) => isBundlePickable(bundle, days));
  const toDispense = bundles.filter((bundle) => isBundleDispensable(bundle, days));
  const total = prescriptionTotal(bundles, linesByOrder);
  const user = session?.user?.person?.display ?? session?.user?.display;

  const pickOrder = async () => {
    setBusy('pick');
    markEncounterAsStale(encounterUuid);
    try {
      for (const bundle of toPick) {
        await updateOrderFulfillerDetails(
          bundle.request.id,
          MedicationRequestFulfillerStatus.in_progress,
          t('pickedBy', 'Picked by {{name}}', { name: user }),
        );
      }
      showSnackbar({
        kind: 'success',
        title: t('orderPicked', 'Order picked'),
        subtitle: t('drugsMovedToPicked', '{{count}} drug(s) moved to Picked', { count: toPick.length }),
      });
    } catch (error) {
      showSnackbar({ kind: 'error', title: t('errorPickingOrder', 'Error picking the order'), subtitle: error?.message });
    } finally {
      await revalidate(mutate, encounterUuid);
      setBusy('');
    }
  };

  const dispenseDrugs = async () => {
    setBusy('dispense');
    markEncounterAsStale(encounterUuid);
    const dispensed: Array<string> = [];
    try {
      for (const bundle of toDispense) {
        const body = initiateMedicationDispenseBody(bundle.request, session, providers, true);
        await saveMedicationDispense(body, MedicationDispenseStatus.completed);
        await updateMedicationRequestFulfillerStatus(bundle.request.id, MedicationRequestFulfillerStatus.completed);
        dispensed.push(bundle.request.id);
      }
      showSnackbar({
        kind: 'success',
        title: t('drugsDispensed', 'Drugs dispensed'),
        subtitle: t('drugsMovedToDispensed', '{{count}} drug(s) moved to Dispensed', { count: dispensed.length }),
      });
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorDispensingDrugs', 'Error dispensing drugs'),
        subtitle: t('dispensedBeforeError', '{{count}} dispensed before the error: {{message}}', {
          count: dispensed.length,
          message: error?.message,
        }),
      });
    }
    // automated billing: one bill for the dispensed drugs that have a price
    const toBill = unbilledOrders(dispensed, linesByOrder);
    if (toBill.length) {
      try {
        const { data } = await generatePharmacyBill(encounterUuid, toBill);
        showSnackbar({
          kind: 'success',
          title: t('billSentToCashier', 'Bill {{receipt}} sent to the cashier', { receipt: data?.receiptNumber }),
          subtitle: formatNaira(data?.total),
        });
      } catch (error) {
        showSnackbar({ kind: 'error', title: t('errorCreatingBill', 'Could not create the bill'), subtitle: error?.message });
      }
    }
    onBillChanged();
    await revalidate(mutate, encounterUuid);
    setBusy('');
  };

  return (
    <div className={styles.bulkActions}>
      {pricesAvailable && (
        <p className={styles.total} data-testid="prescription-total">
          {t('prescriptionTotal', 'Total')}: <strong>{formatNaira(total)}</strong>
        </p>
      )}
      <div className={styles.buttons}>
        {toPick.length > 0 && (
          <Button kind="primary" onClick={() => void pickOrder()} disabled={disabled || Boolean(busy)}>
            {busy === 'pick' ? <InlineLoading description={t('picking', 'Picking...')} /> : t('pickOrder', 'Pick Order')}
          </Button>
        )}
        {toDispense.length > 0 && (
          <Button kind="primary" onClick={() => void dispenseDrugs()} disabled={disabled || Boolean(busy)}>
            {busy === 'dispense' ? (
              <InlineLoading description={t('dispensing', 'Dispensing...')} />
            ) : (
              t('dispenseDrugs', 'Dispense Drugs')
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BulkActions;
