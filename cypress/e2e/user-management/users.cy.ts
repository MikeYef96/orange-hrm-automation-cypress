import { AdminPage } from '../../pages/AdminPage';
import { UserManagementPage } from '../../pages/UserManagementPage';
import {
  createEmployeeViaApi,
  deleteEmployeeViaApi,
  deleteUserByUsername,
} from '../../utils/apiClient';
import { createSystemUserData } from '../../utils/testData';
import { DashboardPage } from '../../pages/DashboardPage';
import {
  OrangeHrmRole,
  OrangeHrmStatus,
  type CreatedEmployee,
  type SystemUserRecord,
} from '../../support/types';

const adminPage = new AdminPage();
const usersPage = new UserManagementPage();
const dashboardPage = new DashboardPage();

describe('User Management', () => {
  let employee: CreatedEmployee;
  let user: SystemUserRecord;
  let cleanupUsername: string | undefined;
  let cleanupEmpNumber: number | undefined;

  beforeEach(() => {
    cleanupUsername = undefined;
    cleanupEmpNumber = undefined;
    cy.loginAsAdmin();
    dashboardPage.visit();

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
    const cleanupUser = username ? deleteUserByUsername(username) : cy.wrap(null, { log: false });

    return cleanupUser.then(() =>
      empNumber === undefined ? cy.wrap(null, { log: false }) : deleteEmployeeViaApi(empNumber),
    );
  });

  it('creates a unique system user and verifies its details', () => {
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
  });

  it('updates a system user role and verifies the change', () => {
    adminPage.openUserManagement();
    usersPage.assertLoaded();
    usersPage.createUser(user);
    usersPage.searchByUsername(user.username);
    usersPage.openEditForUsername(user.username);
    usersPage.changeRole(OrangeHrmRole.Admin);
    usersPage.searchByUsername(user.username);
    usersPage.assertUserInResults({
      username: user.username,
      role: OrangeHrmRole.Admin,
      status: user.status,
      employeeName: employee.displayName,
    });
  });

  it('updates a system user status and verifies the change', () => {
    adminPage.openUserManagement();
    usersPage.assertLoaded();
    user = { ...user, role: OrangeHrmRole.Admin };
    usersPage.createUser(user);
    usersPage.searchByUsername(user.username);
    usersPage.openEditForUsername(user.username);
    usersPage.changeStatus(OrangeHrmStatus.Disabled);
    usersPage.searchByUsername(user.username);
    usersPage.assertUserInResults({
      username: user.username,
      role: OrangeHrmRole.Admin,
      status: OrangeHrmStatus.Disabled,
      employeeName: employee.displayName,
    });
  });

  it('deletes a system user and confirms it is absent from search', () => {
    adminPage.openUserManagement();
    usersPage.assertLoaded();
    usersPage.createUser(user);
    usersPage.deleteUsername(user.username);
    usersPage.assertUserNotFound(user.username);
    cleanupUsername = undefined;
  });
});
