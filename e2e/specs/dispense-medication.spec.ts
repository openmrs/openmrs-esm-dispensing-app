import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import {
  createEncounter,
  deleteDrugOrder,
  deleteEncounter,
  endVisit,
  generateRandomDrugOrder,
  getProvider,
  startVisit,
} from '../commands';
import { type Encounter, type Provider } from '../commands/types';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { test } from '../core';
import { DispensingPage } from '../pages';

let visit: Visit;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.beforeEach(async ({ api, patient }) => {
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
});

test('Dispense prescription', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(process.env.E2E_BASE_URL + `/spa/dispensing`);
  });

  await test.step('And I click on the Active prescriptions tab', async () => {
    await page.getByRole('tab', { name: 'Active prescriptions' }).click();
  });

  await test.step('When I expand an active prescription', async () => {
    const rowText = new RegExp('Expand current row');
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('And I click the Dispense button', async () => {
    await page.getByRole('button', { name: 'Dispense', exact: true }).click();
    await expect(page.getByLabel('Workspace header').getByText('Dispense prescription')).toBeVisible();
  });

  await test.step('And I submit the dispense form', async () => {
    await page.getByRole('button', { name: 'Dispense prescription' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/medication successfully dispensed/i)).toBeVisible();
  });

  await test.step('And the prescription status should be updated to Dispensed', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('Dispensed', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});