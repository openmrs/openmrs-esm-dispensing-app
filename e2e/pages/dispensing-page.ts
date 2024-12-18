import { type Page } from '@playwright/test';

export class DispensingPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/openmrs/spa/dispensing/');
  }
}
