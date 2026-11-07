import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/web/index.php/auth/login';

  private readonly usernameInput = 'input[name="username"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly loginButton = 'button[type="submit"]';
  private readonly alertContent = '.oxd-alert-content-text';
  private readonly fieldError = '.oxd-input-field-error-message';
  private readonly loginTitle = '.orangehrm-login-title, .oxd-text--h5';

  visit(): void {
    cy.visit(this.path);
    this.assertLoaded();
  }

  assertLoaded(): void {
    cy.url().should('include', '/auth/login');
    cy.get(this.usernameInput).should('be.visible');
    cy.get(this.passwordInput).should('be.visible');
    cy.get(this.loginButton).should('be.visible');
  }

  enterUsername(username: string): void {
    cy.get(this.usernameInput).clear().type(username);
  }

  enterPassword(password: string): void {
    cy.get(this.passwordInput).clear().type(password);
  }

  submit(): void {
    cy.get(this.loginButton).click();
  }

  login(username: string, password: string): void {
    this.enterUsername(username);
    this.enterPassword(password);
    this.submit();
  }

  submitEmptyForm(): void {
    cy.get(this.usernameInput).clear();
    cy.get(this.passwordInput).clear();
    this.submit();
  }

  getCredentialAlert(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.alertContent);
  }

  getFieldErrors(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.fieldError);
  }

  getTitle(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(this.loginTitle, 'Login');
  }
}
