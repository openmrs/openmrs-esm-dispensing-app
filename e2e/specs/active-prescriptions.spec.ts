import { expect } from '@playwright/test';
import { type Order, type Visit } from '@openmrs/esm-framework';
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

test('View active prescriptions', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing page', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/dispensing`);
  });

  await test.step('And I click on the Active prescriptions tab', async () => {
    await page.getByRole('tab', { name: 'Active prescriptions' }).click();
    await expect(page.getByRole('tab', { name: 'Active prescriptions' })).toHaveAttribute('aria-selected', 'true');
  });

  await test.step('Then the prescriptions table should display with correct column headers', async () => {
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Patient name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Prescriber' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Drugs' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last dispenser' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  await test.step('And the table should contain the test prescription', async () => {
    const patientName = `${patient.person.display}`;
    const patientRow = page.getByRole('row', { name: new RegExp(patientName) });
    await expect(patientRow.getByRole('cell', { name: patientName })).toBeVisible();
    await expect(patientRow.getByRole('cell', { name: 'Aspirin 81mg' })).toBeVisible();
    await expect(patientRow.getByRole('cell', { name: 'Active' })).toBeVisible();
  });

  await test.step('And I should be able to expand the prescription row to see details', async () => {
    await page
      .getByRole('row', { name: /Expand current row/ })
      .getByLabel('Expand current row')
      .nth(0)
      .click();
    await expect(page.getByLabel('Prescription details', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
