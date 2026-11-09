import { BasePage } from './BasePage';

export abstract class NavigablePage extends BasePage {
  abstract readonly path: string;

  abstract assertLoaded(): void;

  visit(): void {
    cy.visit(this.path);
    this.assertLoaded();
  }
}
