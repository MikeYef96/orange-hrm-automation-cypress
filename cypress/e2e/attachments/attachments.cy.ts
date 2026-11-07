import { MyInfoPage } from '../../pages/MyInfoPage';
import { AttachmentsPage } from '../../pages/AttachmentsPage';
import { createAttachmentFile } from '../../utils/testData';
import { deleteAttachmentViaApi, findAttachmentId } from '../../utils/apiClient';
import type { AttachmentFile } from '../../support/types';

const myInfoPage = new MyInfoPage();
const attachmentsPage = new AttachmentsPage();

describe('My Info — Attachments', () => {
  let file: AttachmentFile;
  let empNumber: number | undefined;
  let cleanupFileName: string | undefined;

  beforeEach(() => {
    file = createAttachmentFile();
    cleanupFileName = file.fileName;

    cy.loginAsAdmin();
    myInfoPage.visit();
    myInfoPage.getEmpNumberFromUrl().then((id) => {
      empNumber = id;
    });
  });

  afterEach(() => {
    const currentEmpNumber = empNumber;
    const fileName = cleanupFileName;

    if (currentEmpNumber === undefined || !fileName) {
      return;
    }

    return findAttachmentId(currentEmpNumber, fileName).then((attachmentId) => {
      if (attachmentId === undefined) {
        return cy.wrap(null, { log: false });
      }
      return deleteAttachmentViaApi(currentEmpNumber, attachmentId);
    });
  });

  it('uploads, lists, downloads, and deletes an attachment with matching file content', () => {
    attachmentsPage.upload(file);
    attachmentsPage.assertListed(file);

    attachmentsPage.download(file.fileName).then((downloadUrl) => {
      cy.request({
        url: downloadUrl,
        encoding: 'utf8',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.match(
          /^(text\/plain|application\/octet-stream)(;|$)/,
        );
        expect(response.body).to.eq(file.contents);
      });
    });

    attachmentsPage.delete(file.fileName);
    attachmentsPage.assertNotListed(file.fileName);
    cleanupFileName = undefined;
  });
});
