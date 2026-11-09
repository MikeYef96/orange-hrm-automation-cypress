import { NavigablePage } from './NavigablePage';
import type { OrangeHrmHiringManager } from '../support/types';

export class VacanciesPage extends NavigablePage {
  readonly path = '/web/index.php/recruitment/viewJobVacancy';

  assertLoaded(): void {
    cy.url().should('include', '/recruitment/viewJobVacancy');
    cy.contains('h5, h6', 'Vacancies').should('be.visible');
    this.waitForSpinnerToDisappear();
  }

  search(): void {
    this.clickButton('Search');
    this.waitForSpinnerToDisappear();
  }

  reset(): void {
    this.clickButton('Reset');
    this.waitForSpinnerToDisappear();
  }

  getRecordsSummary(): Cypress.Chainable<string> {
    return this.recordsFoundLabel()
      .invoke('text')
      .then((text) => text.trim());
  }

  selectFilter(label: string, option: string): void {
    this.selectDropdownOption(label, option);
  }

  addVacancy(name: string, jobTitle: string, manager: OrangeHrmHiringManager): void {
    this.clickAddButton();
    cy.contains('h6', 'Add Vacancy').should('be.visible');
    this.typeIntoLabeledInput('Vacancy Name', name);
    this.selectDropdownOption('Job Title', jobTitle);
    this.selectFirstAutocompleteSuggestion('Hiring Manager', manager.firstName);
    this.clickButton('Save');
    cy.url().should('match', /\/recruitment\/addJobVacancy\/\d+$/);
    this.visit();
  }

  assertEveryVisibleRowContains(expected: string): void {
    this.getVisibleTableRows().should('have.length.at.least', 1);
    this.getVisibleTableRows().each(($row) => {
      expect($row.text()).to.contain(expected);
    });
  }

  assertNoRecords(): void {
    cy.contains(/No Records Found/).should('be.visible');
    cy.get(this.tableCard).should('have.length', 0);
  }
}
