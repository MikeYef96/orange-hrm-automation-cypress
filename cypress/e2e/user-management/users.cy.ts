import { AdminPage } from '../../pages/AdminPage';
import { UserManagementPage } from '../../pages/UserManagementPage';
import {
  createEmployeeViaApi,
  deleteEmployeeViaApi,
  deleteUserByUsername,
} from '../../utils/apiClient';
import { createSystemUserData } from '../../utils/testData';
import {
  OrangeHrmRole,
  OrangeHrmStatus,
  type CreatedEmployee,
  type SystemUserRecord,
} from '../../support/types';

const adminPage = new AdminPage();
const usersPage = new UserManagementPage();

describe('User Management', () => {
  let employee: CreatedEmployee;
  let user: SystemUserRecord;
  let cleanupUsername: string | undefined;
  let cleanupEmpNumber: number | undefined;

  beforeEach(() => {
    cleanupUsername = undefined;
    cleanupEmpNumber = undefined;
    cy.loginAsAdmin();
    cy.visit('/web/index.php/dashboard/index');

    createEmployeeViaApi().then((created) => {
      employee = created;
      cleanupEmpNumber = created.empNumber;
      user = createSystemUserData(created.displayName);
      cleanupUsername = user.username;
    });
  });

  afterEach(() => {
    const username = cleanupUsername;
    const empNumber = cleanupEmpNumber;
    const cleanupUser = username
      ? deleteUserByUsername(username)
      : cy.wrap(null, { log: false });

    return cleanupUser.then(() =>
      empNumber === undefined ? cy.wrap(null, { log: false }) : deleteEmployeeViaApi(empNumber),
    );
  });

  it('creates, searches, updates, and deletes a unique system user', () => {
    adminPage.openUserManagement();
    usersPage.assertLoaded();

    usersPage.createUser(user);
    usersPage.searchByUsername(user.username);
    usersPage.assertUserInResults({
      username: user.username,
      role: user.role,
      status: user.status,
      employeeName: employee.displayName,
    });

    usersPage.openEditForUsername(user.username);
    usersPage.changeRole(OrangeHrmRole.Admin);
    usersPage.searchByUsername(user.username);
    usersPage.assertUserInResults({
      username: user.username,
      role: OrangeHrmRole.Admin,
      status: user.status,
      employeeName: employee.displayName,
    });

    usersPage.openEditForUsername(user.username);
    usersPage.changeStatus(OrangeHrmStatus.Disabled);
    usersPage.searchByUsername(user.username);
    usersPage.assertUserInResults({
      username: user.username,
      role: OrangeHrmRole.Admin,
      status: OrangeHrmStatus.Disabled,
      employeeName: employee.displayName,
    });

    usersPage.deleteUsername(user.username);
    usersPage.assertUserNotFound(user.username);
    cleanupUsername = undefined;
  });
});
