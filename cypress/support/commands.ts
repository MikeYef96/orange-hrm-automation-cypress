import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();

Cypress.Commands.add('loginAsAdmin', () => {
  return cy.env(['username', 'password']).then((credentials) => {
    const username = credentials.username;
    const password = credentials.password;

    if (typeof username !== 'string' || !username || typeof password !== 'string' || !password) {
      throw new Error(
        'Missing OrangeHRM credentials. Copy .env.example to .env and set ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD.',
      );
    }

    return cy.session(
      ['admin', username],
      () => {
        loginPage.visit();
        loginPage.login(username, password);
        dashboardPage.assertLoaded();
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.request({
            url: '/web/index.php/api/v2/dashboard/employees/subunit',
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status, 'admin session is still valid').to.eq(200);
          });
        },
      },
    );
  });
});

Cypress.Commands.add('login', (username: string, password: string) => {
  loginPage.visit();
  loginPage.login(username, password);
});

export {};
