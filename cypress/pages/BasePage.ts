const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class BasePage {
  protected readonly spinner = '.oxd-loading-spinner, .oxd-form-loader';
  protected readonly toast = '.oxd-toast';
  protected readonly toastMessage = '.oxd-text--toast-message, .oxd-toast-content-text';
  protected readonly tableBody = '.oxd-table-body';
  protected readonly tableCard = '.oxd-table-body > .oxd-table-card, .oxd-table-body > .oxd-table-row';
  protected readonly mainMenuItem = '.oxd-main-menu-item';
  protected readonly topbarHeader = '.oxd-topbar-header-breadcrumb, .oxd-text--h6';

  waitForPageReady(): void {
    cy.get(this.spinner, { timeout: 2000 }).should('not.exist');
    cy.get('body').should('be.visible');
  }

  waitForSpinnerToDisappear(): void {
    cy.get(this.spinner).should('not.exist');
  }

  getMainHeading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get('h6').first();
  }

  navigateToMenu(itemName: string): void {
    cy.get(this.mainMenuItem).contains(itemName).click();
    this.waitForSpinnerToDisappear();
  }

  typeIntoLabeledInput(label: string, value: string): void {
    this.getInputByLabel(label).clear().type(value);
  }

  private labeledGroup(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .contains('.oxd-label', new RegExp(`^${label}$`))
      .parents('.oxd-input-group')
      .first();
  }

  getInputByLabel(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return this.labeledGroup(label).find('input').first();
  }

  getTextareaByLabel(label: string): Cypress.Chainable<JQuery<HTMLTextAreaElement>> {
    return this.labeledGroup(label).find('textarea').first();
  }

  selectDropdownOption(label: string, option: string): void {
    this.labeledGroup(label).find('.oxd-select-text').click();

    cy.get('.oxd-select-dropdown')
      .should('be.visible')
      .contains('.oxd-select-option', new RegExp(`^${escapeRegExp(option)}$`))
      .click();
  }

  selectAutocompleteSuggestion(
    label: string,
    query: string,
    expectedName: string | { firstName: string; lastName: string } = query,
  ): void {
    const matchesExpectedName = (value: string): boolean => {
      const parts = value.replace(/\s+/g, ' ').trim().toLowerCase().split(' ');

      if (typeof expectedName === 'string') {
        return parts.join(' ') === expectedName.replace(/\s+/g, ' ').trim().toLowerCase();
      }

      return parts[0] === expectedName.firstName.toLowerCase() &&
        parts[parts.length - 1] === expectedName.lastName.toLowerCase();
    };

    this.labeledGroup(label).find('input').clear().type(query);

    cy.get('.oxd-autocomplete-dropdown')
      .should('be.visible')
      .find('.oxd-autocomplete-option')
      .should(($options) => {
        const matches = [...$options].filter((option) =>
          matchesExpectedName(option.textContent ?? ''),
        );
        expect(matches, 'matching autocomplete options').to.have.length(1);
      })
      .then(($options) => {
        const option = [...$options].find((candidate) =>
          matchesExpectedName(candidate.textContent ?? ''),
        );
        if (!option) {
          throw new Error(`Could not find the expected suggestion for ${label}.`);
        }
        return cy.wrap(option).click();
      })
      .then(() => {
        this.getInputByLabel(label).should(($input) => {
          expect(matchesExpectedName(String($input.val())), 'selected autocomplete result').to.eq(true);
        });
      });
  }

  selectFirstAutocompleteSuggestion(label: string, query: string): void {
    this.labeledGroup(label).find('input').clear().type(query);

    cy.get('.oxd-autocomplete-dropdown')
      .should('be.visible')
      .contains('.oxd-autocomplete-option', query)
      .then(($option) => {
        const optionName = $option.text().replace(/\s+/g, ' ').trim();
        cy.wrap($option).click();

        this.getInputByLabel(label).should(($input) => {
          const selectedName = String($input.val()).replace(/\s+/g, ' ').trim();
          expect(selectedName, 'selected autocomplete result').to.eq(optionName);
        });
      });
  }

  clickButton(text: string): void {
    cy.contains('button', text).should('be.visible').click();
  }

  clickAddButton(): void {
    cy.contains('button', 'Add').should('be.visible').click();
  }

  confirmDelete(): void {
    cy.get('.oxd-dialog-container, .oxd-sheet').filter(':visible').within(() => {
      cy.contains('button', 'Yes, Delete').click();
    });
  }

  getToast(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.toast, { timeout: 15000 }).should('be.visible');
  }

  waitForSuccessToast(expectedText?: string): void {
    const message = expectedText
      ? new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : /Successfully (Saved|Updated|Deleted)/;

    cy.contains(this.toastMessage, message, { timeout: 15000 }).should('be.visible');
  }

  recordsFoundLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains('.orangehrm-horizontal-padding, .orangehrm-paper-container', /Records Found|No Records Found/);
  }

  getVisibleTableRows(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.tableCard);
  }

  getRowByText(text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(this.tableCard, text, { timeout: 15000 });
  }
}
