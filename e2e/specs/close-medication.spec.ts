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

test('Close medication', async ({ page, patient, visit }) => {
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

  await test.step('Then I click the Close button on the Prescription tile', async () => {
    await page.getByRole('button', { name: 'danger Close' }).click();
  });

  await test.step('Then I should see the Close prescription form launched in the workspace', async () => {
    await expect(page.getByText(/close prescription/i)).toBeVisible();
    await expect(page.getByText(/reason for close/i)).toBeVisible();
  });

  await test.step('And when I select Allergy as the reason for closing and submit the form', async () => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByText('Allergy', { exact: true }).click();
    await page.locator('form').getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/medication dispense closed/i)).toBeVisible();
  });

  await test.step('And I should not see the prescription in the Prescriptions table', async () => {
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).not.toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
});
