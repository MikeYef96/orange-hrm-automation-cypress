import { BasePage } from './BasePage';
import { OrangeHrmRole, OrangeHrmStatus, type SystemUserRecord } from '../support/types';

export class UserManagementPage extends BasePage {
  readonly path = '/web/index.php/admin/viewSystemUsers';
  readonly savePath = '/web/index.php/admin/saveSystemUser';

  visit(): void {
    cy.visit(this.path);
    this.assertLoaded();
  }

  assertLoaded(): void {
    cy.url().should('include', '/admin/viewSystemUsers');
    cy.contains('h5, h6', 'System Users').should('be.visible');
    this.waitForSpinnerToDisappear();
  }

  searchByUsername(username: string): void {
    this.typeIntoLabeledInput('Username', username);
    this.clickButton('Search');
    this.waitForSpinnerToDisappear();
  }

  resetSearch(): void {
    this.clickButton('Reset');
    this.waitForSpinnerToDisappear();
  }

  openAddUserForm(): void {
    this.clickAddButton();
    cy.contains('h6', 'Add User').should('be.visible');
  }

  fillUserForm(user: Pick<SystemUserRecord, 'username' | 'password' | 'role' | 'status' | 'employeeName'>): void {
    this.selectDropdownOption('User Role', user.role);
    this.selectAutocompleteSuggestion('Employee Name', user.employeeName);
    this.selectDropdownOption('Status', user.status);
    this.typeIntoLabeledInput('Username', user.username);
    this.typeIntoLabeledInput('Password', user.password);
    this.typeIntoLabeledInput('Confirm Password', user.password);
  }

  saveUser(): void {
    this.clickButton('Save');
  }

  createUser(user: SystemUserRecord): void {
    this.openAddUserForm();
    this.fillUserForm(user);
    this.saveUser();
    this.waitForSuccessToast('Successfully Saved');
    this.assertLoaded();
  }

  assertUserInResults(user: Pick<SystemUserRecord, 'username' | 'role' | 'status' | 'employeeName'>): void {
    this.getRowByText(user.username).within(() => {
      cy.contains(user.username).should('be.visible');
      cy.contains(user.role).should('be.visible');
      cy.contains(user.status).should('be.visible');
      user.employeeName.split(' ').forEach((part) => {
        cy.contains(part).should('be.visible');
      });
    });
  }

  openEditForUsername(username: string): void {
    this.getRowByText(username).within(() => {
      cy.get('button:has(.bi-pencil-fill)').click({ force: true });
    });
    cy.contains('h6', 'Edit User').should('be.visible');
  }

  changeStatus(status: OrangeHrmStatus): void {
    this.selectDropdownOption('Status', status);
    this.clickButton('Save');
    this.waitForSuccessToast('Successfully Updated');
    this.assertLoaded();
  }

  changeRole(role: OrangeHrmRole): void {
    this.selectDropdownOption('User Role', role);
    this.clickButton('Save');
    this.waitForSuccessToast('Successfully Updated');
    this.assertLoaded();
  }

  deleteUsername(username: string): void {
    this.getRowByText(username).within(() => {
      cy.get('button:has(.bi-trash)').click({ force: true });
    });
    this.confirmDelete();
    this.waitForSuccessToast('Successfully Deleted');
  }

  assertUserNotFound(username: string): void {
    this.searchByUsername(username);
    cy.contains(/No Records Found/).should('be.visible');
    cy.get('body').should('not.contain', username);
  }
}
