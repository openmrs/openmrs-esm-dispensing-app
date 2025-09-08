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
import { deleteMedicationDespense, generateMedicationDispense } from '../commands/medication-dispense-operation';

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

test('Delete prescription', async ({ fhirApi, page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`/openmrs/spa/dispensing`);
  });

  await test.step('When I expand the prescription row', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
  });

  await test.step('And I navigate to the History and comments tab', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
  });

  await test.step('And I click on the Options menu', async () => {
    await page.getByRole('button', { name: 'Options' }).first().click();
  });

  await test.step('And I select the Delete option', async () => {
    await page.getByRole('menuitem', { name: 'Delete' }).click();
  });

  await test.step('And I select the Delete button in the modal', async () => {
    await page.getByRole('button', { name: 'danger Delete' }).click();
  });

  await test.step('Then I should see a "medication dispense deleted" success notification', async () => {
    await expect(page.getByText(/medication dispense was deleted successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api, fhirApi }) => {
  await deleteMedicationDespense(fhirApi, medicationDispense.id);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
