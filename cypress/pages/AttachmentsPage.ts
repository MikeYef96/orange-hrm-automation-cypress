import { BasePage } from './BasePage';
import type { AttachmentFile } from '../support/types';

export class AttachmentsPage extends BasePage {
  private readonly fileInput = 'input[type="file"]';
  private readonly downloadButton = 'button:has(.bi-download)';

  scrollToSection(): void {
    cy.contains('h6', 'Attachments', { timeout: 20000 }).scrollIntoView();
    cy.contains('h6', 'Attachments').should('be.visible');
  }

  openAddForm(): void {
    this.scrollToSection();
    cy.contains('h6', 'Attachments').parent().find('button').first().click();
    cy.contains('h6', 'Add Attachment').should('be.visible');
  }

  upload(file: AttachmentFile): void {
    this.openAddForm();
    cy.get(this.fileInput).selectFile(
      {
        contents: Cypress.Buffer.from(file.contents),
        fileName: file.fileName,
        mimeType: file.mimeType,
      },
      { force: true },
    );
    this.getTextareaByLabel('Comment').clear().type(file.description);
    cy.contains('h6', 'Add Attachment')
      .closest('.orangehrm-card-container')
      .within(() => {
        cy.contains('button', 'Save').click();
      });
    this.waitForSuccessToast('Successfully Saved');
  }

  assertListed(file: AttachmentFile): void {
    this.scrollToSection();
    this.getRowByText(file.fileName).within(() => {
      cy.contains(file.fileName).should('be.visible');
      cy.contains(file.description).should('be.visible');
    });
  }

  download(fileName: string): Cypress.Chainable<string> {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('attachmentWindowOpen');
    });

    this.getRowByText(fileName).within(() => {
      cy.get(this.downloadButton).click({ force: true });
    });

    return cy
      .get('@attachmentWindowOpen')
      .should('have.been.called')
      .its('firstCall.args.0')
      .then((openedUrl: unknown) => {
        const url = String(openedUrl);
        expect(url, 'download URL').to.match(/viewAttachment/);
        return url;
      });
  }

  delete(fileName: string): void {
    this.getRowByText(fileName).within(() => {
      cy.get('button:has(.bi-trash)').click({ force: true });
    });
    this.confirmDelete();
    this.waitForSuccessToast('Successfully Deleted');
  }

  assertNotListed(fileName: string): void {
    this.scrollToSection();
    cy.contains('.orangehrm-attachment', fileName).should('not.exist');
  }
}
