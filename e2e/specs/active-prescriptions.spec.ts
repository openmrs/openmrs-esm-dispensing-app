import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient } from '../commands';
import { test } from '../core';
import { DispensingPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('View active prescriptions', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I visit the Dispensing page under the active prescriptions tab', async () => {
    await dispensingPage.goTo();

    const activeTab = page.getByRole('tab', { name: 'Active prescriptions' });
    await expect(activeTab).toContainText('Active prescriptions');

    // const allTab = page.getByRole('tab', { name: 'All prescriptions' });
    // await expect(allTab).toHaveAttribute('aria-selected', 'false');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
