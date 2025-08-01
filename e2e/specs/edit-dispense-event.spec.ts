import { expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Visit } from '@openmrs/esm-framework';
import {
  createEncounter,
  deleteDrugOrder,
  deleteEncounter,
  deleteMedicationDispense,
  generateMedicationDispense,
  endVisit,
  generateRandomDrugOrder,
  getProvider,
  startVisit,
} from '../commands';
import { DispensingPage } from '../pages';
import { test } from '../core';
import { type Encounter, type Provider } from '../commands/types';
import { type MedicationDispense } from '../../src/types';

let drugOrder: Order;
let encounter: Encounter;
let medicationDispense: MedicationDispense;
let orderer: Provider;
let visit: Visit;

test.beforeEach(async ({ fhirApi, api, patient }) => {
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);

  // Wait for OpenMRS to process the order and make it available via FHIR
  await new Promise((resolve) => setTimeout(resolve, 2000));

  medicationDispense = await generateMedicationDispense(fhirApi, patient, orderer, drugOrder.uuid);
});

test('Edit medication dispense', async ({ fhirApi, page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`/openmrs/spa/dispensing`);
  });

  await test.step('When I expand an active prescription', async () => {
    const rowText = new RegExp('Expand current row');
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
  });

  await test.step('And I navigate to the History and comments tab', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('QUANTITY 5 Tablet')).toBeVisible();
  });

  await test.step('And I edit the dispense record', async () => {
    await page.getByRole('button', { name: 'Options' }).first().click();
    await page.getByRole('menuitem', { name: 'Edit Record' }).click();
  });

  await test.step('And I update the quantity to 9', async () => {
    await page.getByRole('spinbutton', { name: 'Quantity' }).click();
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('9');
  });

  await test.step('And I save the changes', async () => {
    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
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
