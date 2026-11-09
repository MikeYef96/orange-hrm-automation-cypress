import { NavigablePage } from './NavigablePage';

export class MyInfoPage extends NavigablePage {
  readonly path = '/web/index.php/pim/viewMyDetails';

  openFromMenu(): void {
    this.navigateToMenu('My Info');
    this.assertLoaded();
  }

  assertLoaded(): void {
    cy.url().should('include', '/pim/viewPersonalDetails');
    cy.contains('h6', 'Personal Details').should('be.visible');
  }

  getEmpNumberFromUrl(): Cypress.Chainable<number> {
    return cy.url().then((url) => {
      const match = url.match(/empNumber\/(\d+)/);
      if (!match) {
        throw new Error(`Could not parse empNumber from ${url}`);
      }
      return Number(match[1]);
    });
  }
}
