import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly usersPath = '/web/index.php/admin/viewSystemUsers';

  openUserManagement(): void {
    this.navigateToMenu('Admin');
    cy.url().should('include', '/admin/viewSystemUsers');
    cy.contains('h6', 'User Management').should('be.visible');
  }
}
