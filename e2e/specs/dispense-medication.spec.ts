import { expect } from '@playwright/test';
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

  await test.step('And I expand a table row in the Prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('Then I click the Dispense button to launch the Dispense prescription form', async () => {
    await page.getByRole('button', { name: 'Dispense', exact: true }).click();
    await expect(page.getByLabel('Workspace header').getByText('Dispense prescription')).toBeVisible();
  });

  await test.step('Then I submit the form by clicking the Dispense prescription button', async () => {
    await page.getByRole('button', { name: 'Dispense prescription' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/medication successfully dispensed/i)).toBeVisible();
  });

  await test.step('And when I click the `History and comments` tab I should see the updated `Dispensed` status reflected', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('Dispensed', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
