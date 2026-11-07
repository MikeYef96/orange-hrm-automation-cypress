import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import type { InvalidPasswordCase } from '../../support/types';

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();

describe('Login', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  it('logs in successfully with environment credentials and lands on the dashboard', () => {
    cy.env(['username', 'password']).then((credentials) => {
      if (typeof credentials.username !== 'string' || !credentials.username ||
          typeof credentials.password !== 'string' || !credentials.password) {
        throw new Error('Set ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD in .env to test successful login.');
      }

      loginPage.login(credentials.username, credentials.password);
      dashboardPage.assertLoaded();
      cy.contains('.oxd-userdropdown-name, .oxd-userdropdown-tab', /.+/).should('be.visible');
    });
  });

  it('shows a field validation error when credentials are empty', () => {
    loginPage.submitEmptyForm();
    loginPage.assertLoaded();
    loginPage.getFieldErrors().should('have.length.at.least', 2);
    loginPage.getFieldErrors().each(($error) => {
      expect($error.text().trim()).to.eq('Required');
    });
    cy.url().should('include', '/auth/login');
  });

  it('rejects invalid credentials from the users fixture', () => {
    cy.fixture('users').then((data: { invalidPasswordCases: InvalidPasswordCase[] }) => {
      data.invalidPasswordCases.forEach((testCase) => {
        const verifyInvalidLogin = (testUsername: string): void => {
          loginPage.visit();
          loginPage.login(testUsername, testCase.password);
          loginPage.getCredentialAlert().should('contain.text', testCase.expectedAlert);
          loginPage.assertLoaded();
        };

        if (testCase.username === null) {
          cy.env(['username']).then((credentials) => {
            if (typeof credentials.username !== 'string' || !credentials.username) {
              throw new Error('Set ORANGEHRM_USERNAME in .env to run invalid-password cases.');
            }
            verifyInvalidLogin(credentials.username);
          });
        } else {
          verifyInvalidLogin(testCase.username);
        }
      });
    });
  });

  it('logs out and returns to the login page', () => {
    cy.loginAsAdmin();
    cy.visit('/web/index.php/dashboard/index');
    dashboardPage.assertLoaded();
    dashboardPage.logout();
    loginPage.assertLoaded();
    loginPage.getTitle().should('be.visible');
  });
});
