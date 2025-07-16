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
import { type MedicationDispense } from '../../src/types';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { test } from '../core';
import { DispensingPage } from '../pages';
import { deleteMedicationDispense, generateMedicationDispense } from '../commands/medication-dispense-operation';

let visit: Visit;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;
let medicationDispense: MedicationDispense;

test.beforeEach(async ({ fhirApi, api, patient }) => {
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
  medicationDispense = await generateMedicationDispense(fhirApi, patient, orderer, drugOrder.uuid);
});

test('Edit medication dispense', async ({ fhirApi, page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`/openmrs/spa/dispensing`);
  });

  await test.step('And I expand a table row in the Prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
  });

  await test.step('And I navigate to the History and comments tab', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('QUANTITY 5 Tablet')).toBeVisible();
  });

  await test.step('And I click on the Options menu', async () => {
    await page.getByRole('button', { name: 'Options' }).first().click();
  });

  await test.step('And I select the Edit option', async () => {
    await page.getByRole('menuitem', { name: 'Edit Record' }).click();
  });

  await test.step('And I update the quantity', async () => {
    await page.getByRole('spinbutton', { name: 'Quantity' }).click();
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('9');
  });

  await test.step('And I click the "Save changes" button', async () => {
    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  await test.step('Then I should see a "medication dispense list has been updated" success notification', async () => {
    await expect(page.getByText(/medication dispense list has been updated/i)).toBeVisible();
  });

  await test.step('Then I see the quantity updated from 5 to 9 to confirm the dispense event has been updated', async () => {
    await expect(page.getByText('QUANTITY 9 Tablet')).toBeVisible();
  });
});

test.afterEach(async ({ api, fhirApi }) => {
  await deleteMedicationDispense(fhirApi, medicationDispense.id);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
