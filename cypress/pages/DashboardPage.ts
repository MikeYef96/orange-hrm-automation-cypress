import { NavigablePage } from './NavigablePage';

export class DashboardPage extends NavigablePage {
  readonly path = '/web/index.php/dashboard/index';

  private readonly userMenu = '.oxd-userdropdown-tab';
  private readonly logoutLink = 'a[href*="logout"]';
  private readonly widget = '.orangehrm-dashboard-widget';
  private readonly widgetHeader =
    '.orangehrm-dashboard-widget-header, .orangehrm-dashboard-widget-name';
  private readonly widgetBody = '.orangehrm-dashboard-widget-body';

  assertLoaded(): void {
    cy.url().should('include', '/dashboard');
    cy.contains('h6', 'Dashboard').should('be.visible');
    cy.get(this.widget).should('have.length.at.least', 2);
  }

  openUserMenu(): void {
    cy.get(this.userMenu).should('be.visible').click();
  }

  logout(): void {
    this.openUserMenu();
    cy.contains(this.logoutLink, 'Logout').click();
  }

  getWidget(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(this.widget, title, { timeout: 20000 }).should('be.visible');
  }

  getWidgetTitle(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getWidget(title).find(this.widgetHeader).contains(title);
  }

  getWidgetBody(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getWidget(title).find(this.widgetBody);
  }

  getChartGraphic(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getWidget(title).find('canvas, svg');
  }

  getChartLabels(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getWidget(title).find('.orangehrm-dashboard-widget-body li');
  }
}
