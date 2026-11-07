import { BasePage } from './BasePage';

export class RecruitmentPage extends BasePage {
  openVacancies(): void {
    this.navigateToMenu('Recruitment');
    cy.contains('.oxd-topbar-body-nav-tab, a', 'Vacancies').click();
    cy.url().should('include', '/recruitment/viewJobVacancy');
  }
}
