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
import { deleteMedicationDespense, generateMedicationDispense } from '../commands/medication-request-operation';
// import { fhirApi } from '../fixtures';

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
  medicationDispense = await generateMedicationDispense(fhirApi, patient, orderer);
});

test('Delete medication dispense', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);
  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(process.env.E2E_BASE_URL + `/spa/dispensing`);
  });

  await test.step('And I expand a table row in the Prescriptions table corresponding to an active prescription', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await page.getByRole('button', { name: 'Options' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'danger Delete' }).click();
    await expect(page.getByText(/medication dispense was deleted successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api, fhirApi }) => {
  await deleteMedicationDespense(fhirApi, medicationDispense.id);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
