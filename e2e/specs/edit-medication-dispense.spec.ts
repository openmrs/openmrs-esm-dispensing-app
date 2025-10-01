import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Visit } from '@openmrs/esm-framework';
import {
  createEncounter,
  deleteDrugOrder,
  deleteEncounter,
  deleteMedicationDispense,
  endVisit,
  generateMedicationDispense,
  generateRandomDrugOrder,
  getProvider,
  startVisit,
} from '../commands';
import { DispensingPage } from '../pages';
import { test } from '../core';
import { type Encounter, type Provider } from '../commands/types';
import { type MedicationDispense } from '../../src/types';

let visit: Visit;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;
let medicationDispense: MedicationDispense;

test.beforeEach(async ({ api, fhirApi, page, patient }) => {
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
  medicationDispense = await generateMedicationDispense(fhirApi, patient, orderer, drugOrder.uuid);

  // Wait for OpenMRS to process the dispense and make it available
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(10000);
});

test('Edit medication dispense', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/dispensing`);
  });

  await test.step('And I click on the "All prescriptions" tab', async () => {
    await page.getByRole('tab', { name: 'All prescriptions' }).click();
    await expect(page.getByRole('tab', { name: 'All prescriptions' })).toHaveAttribute('aria-selected', 'true');
  });

  await test.step('Then I should see the prescription in the table', async () => {
    await expect(page.getByRole('row', { name: 'Expand current row' }).first()).toBeVisible({ timeout: 15000 });
  });

  await test.step('And I expand the prescription row', async () => {
    await page.getByRole('row', { name: 'Expand current row' }).getByLabel('Expand current row').first().click();
  });

  await test.step('And I navigate to the History and comments tab', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('QUANTITY 5 Tablet')).toBeVisible();
  });

  await test.step('And I edit the dispense record', async () => {
    await page.getByLabel('History and comments').getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitem', { name: 'Edit Record' }).click();
  });

  await test.step('And I update the quantity to 9', async () => {
    await page.getByRole('spinbutton', { name: 'Quantity' }).click();
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('9');
  });

  await test.step('And I save the changes', async () => {
    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  await test.step('Then I should see a success notification confirming the update', async () => {
    await expect(page.getByText(/medication dispense list has been updated/i)).toBeVisible();
  });

  await test.step('And the quantity should be updated to 9', async () => {
    await expect(page.getByText('QUANTITY 9 Tablet')).toBeVisible();
  });
});

test.afterEach(async ({ api, fhirApi }) => {
  await deleteMedicationDispense(fhirApi, medicationDispense.id);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
