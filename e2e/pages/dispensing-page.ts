import { type Page } from '@playwright/test';

export class DispensingPage {
  constructor(readonly page: Page) {}

  async goTo() {
    await this.page.goto('/openmrs/spa/dispensing');
  }
}
