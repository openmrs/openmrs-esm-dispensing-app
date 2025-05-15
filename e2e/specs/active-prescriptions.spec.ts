import { expect } from '@playwright/test';
import { type Patient } from '../commands';
import { test } from '../core';
import { DispensingPage } from '../pages';

let patient: Patient;

test('View active prescriptions', async ({ page }) => {
  const dispensingPage = new DispensingPage(page);

  await test.step('Should navigate to the dispensing page diplaying active prescriptions', async () => {
    await dispensingPage.goTo();

    await test.step('Then I should be at the prescriptions page', async () => {
      await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}spa/dispensing`);
    });
  });
});
