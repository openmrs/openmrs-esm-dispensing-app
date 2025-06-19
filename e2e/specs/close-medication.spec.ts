import { expect } from '@playwright/test';
import { generateRandomDrugOrder, deleteDrugOrder, createEncounter, deleteEncounter, getProvider } from '../commands';
import { type Encounter, type Provider } from '../commands/types';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { test } from '../core';
import { DispensingPage } from '../pages';

let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.beforeEach(async ({ api, patient, visit }) => {
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
});

test('Close medication', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);
  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(process.env.E2E_BASE_URL + `/spa/dispensing`);
  });

  await test.step('And I expand a table row in the Prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('Then I click danger close', async () => {
    await page.getByRole('button', { name: 'danger Close' }).click();
    await expect(page.getByText('Close prescription')).toBeVisible();
    await expect(page.getByText('Reason for close')).toBeVisible();
  });

  await test.step('Then I select the reason for closing and click close', async () => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByText('Allergy', { exact: true }).click();
    await page.locator('form').getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(
      page.getByText(/Snackbar notificationMedication dispense closed.Medication dispense closed./i),
    ).toBeVisible();
  });

  await test.step('Then I click on History and comments and should see Dispensed status', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('Closed', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
});
