import { expect } from '@playwright/test';
import { test } from '../core';
import { DispensingPage } from '../pages';

test('View active prescriptions', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('Given I am on the dispensing page', async () => {
    await dispensingPage.goTo();

    await test.step('Then I should be at the prescriptions page', async () => {
      await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/dispensing`);
    });
  });
});
