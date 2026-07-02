import { expect } from '@playwright/test';
import { type Order, type Visit } from '@openmrs/esm-framework';
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

test.beforeEach(async ({ api, fhirApi, patient }) => {
  visit = await startVisit(api, patient.uuid);
  orderer = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, orderer.uuid, visit);
  drugOrder = await generateRandomDrugOrder(api, patient.uuid, encounter, orderer.uuid);
  medicationDispense = await generateMedicationDispense(fhirApi, patient, orderer, drugOrder.uuid);

  // Wait until the dispense is returned by the same FHIR search the prescription
  // details view issues, so the UI is guaranteed to see it once the test starts
  await expect
    .poll(
      async () => {
        const response = await fhirApi.get(
          `MedicationRequest?encounter=${encounter.uuid}&_revinclude=MedicationDispense:prescription`,
        );
        if (!response.ok()) {
          return 0;
        }
        const bundle = await response.json();
        return (
          bundle.entry?.filter(
            (entry: { resource?: { resourceType?: string } }) => entry.resource?.resourceType === 'MedicationDispense',
          ).length ?? 0
        );
      },
      { timeout: 30000 },
    )
    .toBeGreaterThan(0);
});

test('Edit medication dispense', async ({ page, patient }) => {
  const dispensingPage = new DispensingPage(page);
  const patientRow = page.getByRole('row', { name: new RegExp(patient.person.display) });
  const historyTabPanel = page.getByRole('tabpanel', { name: 'History and comments' });

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/dispensing`);
  });

  await test.step('And I click on the "All prescriptions" tab', async () => {
    await page.getByRole('tab', { name: 'All prescriptions' }).click();
    await expect(page.getByRole('tab', { name: 'All prescriptions' })).toHaveAttribute('aria-selected', 'true');
  });

  await test.step("Then I should see the patient's prescription in the table", async () => {
    await expect(patientRow).toBeVisible({ timeout: 15000 });
  });

  await test.step('And I expand the prescription row', async () => {
    await patientRow.getByLabel('Expand current row').click();
  });

  await test.step('And I navigate to the History and comments tab', async () => {
    await page.getByRole('tab', { name: 'History and comments' }).click();
    await expect(historyTabPanel.getByText('QUANTITY 5 Tablet')).toBeVisible();
  });

  await test.step('And I edit the dispense record', async () => {
    await historyTabPanel.getByRole('button', { name: 'Options' }).click();
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
    await expect(historyTabPanel.getByText('QUANTITY 9 Tablet')).toBeVisible();
  });
});

test.afterEach(async ({ api, fhirApi }) => {
  await deleteMedicationDispense(fhirApi, medicationDispense.id);
  await deleteEncounter(api, encounter.uuid);
  await deleteDrugOrder(api, drugOrder.uuid);
  await endVisit(api, visit);
});
