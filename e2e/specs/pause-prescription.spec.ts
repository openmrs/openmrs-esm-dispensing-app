import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Visit } from '@openmrs/esm-framework';
import {
  generateRandomDrugOrder,
  deleteDrugOrder,
  createEncounter,
  deleteEncounter,
  getProvider,
  startVisit,
  endVisit,
} from '../commands';
import { type Encounter, type Provider } from '../commands/types';
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

test('Pause prescription', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
  });

  await test.step('And I expand a table row in the prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('Then I click the Pause button on the prescription tile', async () => {
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByText(/pause prescription/i)).toBeVisible();
    await expect(page.getByText(/reason for pause/i)).toBeVisible();
  });

  await test.step('And I select "Allergy" as the reason for pausing the prescription and then submit the form', async () => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByText('Allergy', { exact: true }).click();
    await page.locator('form').getByRole('button', { name: 'Pause' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/medication dispense paused./i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
