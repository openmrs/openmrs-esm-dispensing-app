import { expect } from '@playwright/test';
import { test } from '../core';
import { DispensingPage } from '../pages';

test('View active prescriptions', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I navigate to the dispensing app', async () => {
    await dispensingPage.goTo();
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/dispensing`);
  });

  await test.step('And I click on the "Active prescriptions" tab', async () => {
    await page.getByRole('tab', { name: 'Active prescriptions' }).click();
    await expect(page.getByRole('tab', { name: 'Active prescriptions' })).toHaveAttribute('aria-selected', 'true');
  });

  await test.step('Then I should see the prescriptions table with active prescriptions', async () => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Active prescriptions' })).toBeVisible();
  });
});
