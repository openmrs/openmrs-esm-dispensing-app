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

test('Close prescription', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);
  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
  });

  await test.step('And I expand a table row in the prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('Then I click the Close button on the prescription tile', async () => {
    await page.getByRole('button', { name: 'danger Close' }).click();
    await expect(page.getByText('Close prescription')).toBeVisible();
    await expect(page.getByText('Reason for close')).toBeVisible();
  });

  await test.step('And when I select Allergy as the reason for closing and submit the form', async () => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByText('Allergy', { exact: true }).click();
    await page.locator('form').getByRole('button', { name: 'Close' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/medication dispense closed/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
