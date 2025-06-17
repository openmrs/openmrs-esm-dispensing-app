import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import {
  type Patient,
  generateRandomPatient,
  deletePatient,
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

let patient: Patient;
let visit: Visit;
let drugOrder: Order;
let encounter: Encounter;
let orderer: Provider;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
});

test('Dispensing medication in pharmacy app', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);
  await test.step('When I navigate to the dispensing page diplaying active prescri', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(process.env.E2E_BASE_URL + `/spa/dispensing`);
  });

  await test.step('And I expand the patient row', async () => {
    const rowText = new RegExp(`Expand current row`);
    await page.getByRole('row', { name: rowText }).getByLabel('Expand current row').nth(0).click();
    await expect(page.getByLabel('Prescription details', { exact: true }).getByText('Aspirin 81mg')).toBeVisible();
  });

  await test.step('Then I click dispense', async () => {
    await page.getByRole('button', { name: 'Dispense', exact: true }).click();
    await expect(page.getByLabel('Workspace header').getByText('Dispense prescription')).toBeVisible();
  });

  await test.step('Then I click dispense prescription', async () => {
    await page.getByRole('button', { name: 'Dispense prescription' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(
      page.getByText(
        /Snackbar notificationMedication successfully dispensed.Medication dispense list has been updated./i,
      ),
    ).toBeVisible();
  });

  await test.step('Then I click on History and comments and should see Dispensed status', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(page.getByText('Dispensed', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await deletePatient(api, patient.uuid);
  await endVisit(api, visit);
});
