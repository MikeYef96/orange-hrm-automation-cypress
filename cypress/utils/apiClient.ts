import type {
  CreatedEmployee,
  OrangeHrmAttachment,
  OrangeHrmEmployee,
  OrangeHrmHiringManager,
  OrangeHrmJobTitle,
  OrangeHrmUser,
  OrangeHrmVacancy,
} from '../support/types';
import { createEmployeePayload } from './testData';

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function getListData<T>(response: Cypress.Response<unknown>, label: string): T[] {
  expect(response.status, `${label} HTTP status`).to.eq(200);
  expect(response.body, `${label} response`).to.be.an('object');

  const body = response.body as { data?: unknown };
  expect(body.data, `${label} data`).to.be.an('array');
  return body.data as T[];
}

function assertCleanupStatus(response: Cypress.Response<unknown>, label: string): void {
  expect(response.status, `${label} cleanup HTTP status`).to.eq(200);
}

export function apiRequest(
  options: Partial<Cypress.RequestOptions> & Pick<Cypress.RequestOptions, 'url' | 'method'>,
): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy.request({
    failOnStatusCode: false,
    headers: jsonHeaders,
    ...options,
  });
}

export function createEmployeeViaApi(): Cypress.Chainable<CreatedEmployee> {
  const payload = createEmployeePayload();

  return apiRequest({
    method: 'POST',
    url: '/web/index.php/api/v2/pim/employees',
    body: {
      firstName: payload.firstName,
      middleName: '',
      lastName: payload.lastName,
      employeeId: payload.employeeId,
    },
  }).then<CreatedEmployee>((response) => {
    expect(response.status, 'employee API create').to.eq(200);
    expect(response.body, 'employee API response').to.be.an('object');
    const body = response.body as { data?: unknown };
    expect(body.data, 'created employee').to.be.an('object');
    const data = body.data as OrangeHrmEmployee;
    expect(data.empNumber, 'created employee number').to.be.a('number').and.greaterThan(0);

    return {
      empNumber: data.empNumber,
      employeeId: payload.employeeId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: `${payload.firstName} ${payload.lastName}`,
    };
  });
}

export function deleteEmployeeViaApi(empNumber: number): Cypress.Chainable<null> {
  return apiRequest({
    method: 'DELETE',
    url: '/web/index.php/api/v2/pim/employees',
    body: { ids: [empNumber] },
  }).then<null>((response) => {
    assertCleanupStatus(response, 'Employee');
    return cy.wrap(null, { log: false });
  });
}

export function findUserIdByUsername(username: string): Cypress.Chainable<number | undefined> {
  return apiRequest({
    method: 'GET',
    url: '/web/index.php/api/v2/admin/users',
    qs: { username, limit: 50 },
  }).then<number | undefined>((response) => {
    const userId = getListData<OrangeHrmUser>(response, 'User cleanup lookup').find(
      (user) => user.userName === username,
    )?.id;
    return cy.wrap(userId, { log: false });
  });
}

export function deleteUserViaApi(userId: number): Cypress.Chainable<null> {
  return apiRequest({
    method: 'DELETE',
    url: '/web/index.php/api/v2/admin/users',
    body: { ids: [userId] },
  }).then<null>((response) => {
    assertCleanupStatus(response, 'User');
    return cy.wrap(null, { log: false });
  });
}

export function deleteUserByUsername(username: string): Cypress.Chainable<null> {
  return findUserIdByUsername(username).then((userId) => {
    if (userId !== undefined) {
      return deleteUserViaApi(userId);
    }
    return cy.wrap(null, { log: false });
  });
}

export function listVacancies(): Cypress.Chainable<OrangeHrmVacancy[]> {
  return apiRequest({
    method: 'GET',
    url: '/web/index.php/api/v2/recruitment/vacancies',
    qs: { limit: 0, model: 'detailed' },
  }).then((response) => {
    return getListData<OrangeHrmVacancy>(response, 'Vacancies API list');
  });
}

export function listJobTitles(): Cypress.Chainable<OrangeHrmJobTitle[]> {
  return apiRequest({
    method: 'GET',
    url: '/web/index.php/api/v2/admin/job-titles',
    qs: { limit: 0 },
  }).then((response) => {
    return getListData<OrangeHrmJobTitle>(response, 'Job titles API list');
  });
}

export function listHiringManagers(): Cypress.Chainable<OrangeHrmHiringManager[]> {
  return apiRequest({
    method: 'GET',
    url: '/web/index.php/api/v2/recruitment/hiring-managers',
    qs: { limit: 0 },
  }).then((response) => {
    return getListData<OrangeHrmHiringManager>(response, 'Hiring managers API list');
  });
}

export function deleteVacancyByName(name: string): Cypress.Chainable<null> {
  return listVacancies().then<null>((vacancies) => {
    const vacancy = vacancies.find((item) => item.name === name);
    if (!vacancy) {
      return cy.wrap(null, { log: false });
    }

    return apiRequest({
      method: 'DELETE',
      url: '/web/index.php/api/v2/recruitment/vacancies',
      body: { ids: [vacancy.id] },
    }).then<null>((response) => {
      assertCleanupStatus(response, 'Vacancy');
      return cy.wrap(null, { log: false });
    });
  });
}

export function findAttachmentId(
  empNumber: number,
  fileName: string,
): Cypress.Chainable<number | undefined> {
  return apiRequest({
    method: 'GET',
    url: `/web/index.php/api/v2/pim/employees/${empNumber}/screen/personal/attachments`,
    qs: { limit: 50 },
  }).then<number | undefined>((response) => {
    const attachmentId = getListData<OrangeHrmAttachment>(
      response,
      'Attachment cleanup lookup',
    ).find((item) => item.filename === fileName)?.id;
    return cy.wrap(attachmentId, { log: false });
  });
}

export function deleteAttachmentViaApi(
  empNumber: number,
  attachmentId: number,
): Cypress.Chainable<null> {
  return apiRequest({
    method: 'DELETE',
    url: `/web/index.php/api/v2/pim/employees/${empNumber}/screen/personal/attachments`,
    body: { ids: [attachmentId] },
  }).then((response) => {
    assertCleanupStatus(response, 'Attachment');
    return cy.wrap(null, { log: false });
  });
}
