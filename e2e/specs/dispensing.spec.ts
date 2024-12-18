import { test, expect } from '@playwright/test';
import { DispensingPage } from '../pages';

// This test is a sample E2E test. You can delete it.

test('Navigate to the dispensing page', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('When I visit the dispensing page', async () => {
    await dispensingPage.goto();
  });

  await test.step('Then I should see the active prescriptions tab', async () => {
    await expect(page.getByRole('tab', { name: /active prescriptions/i })).toBeVisible();
  });
});
