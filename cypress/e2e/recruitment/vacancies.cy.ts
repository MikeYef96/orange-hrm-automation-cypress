import { RecruitmentPage } from '../../pages/RecruitmentPage';
import { VacanciesPage } from '../../pages/VacanciesPage';
import { DashboardPage } from '../../pages/DashboardPage';
import {
  createEmployeeViaApi,
  deleteEmployeeViaApi,
  deleteVacancyByName,
  listHiringManagers,
  listJobTitles,
} from '../../utils/apiClient';
import { createVacancyName } from '../../utils/testData';
import type { OrangeHrmHiringManager, OrangeHrmJobTitle } from '../../support/types';

const recruitmentPage = new RecruitmentPage();
const vacanciesPage = new VacanciesPage();
const dashboardPage = new DashboardPage();

describe('Recruitment — Job Vacancies', () => {
  let vacancyName: string;
  let hiringManagerEmpNumber: number | undefined;
  let jobTitle: OrangeHrmJobTitle;
  let hiringManager: OrangeHrmHiringManager;

  beforeEach(() => {
    vacancyName = createVacancyName();
    hiringManagerEmpNumber = undefined;
    cy.loginAsAdmin();
    dashboardPage.visit();
    recruitmentPage.openVacancies();
    vacanciesPage.assertLoaded();

    listJobTitles().then((jobTitles) => {
      const firstJobTitle = jobTitles[0];
      if (!firstJobTitle) {
        throw new Error('Cannot run vacancy filters: the demo has no job titles available.');
      }
      jobTitle = firstJobTitle;

      return listHiringManagers().then((managers) => {
        const existingManager = managers[0];
        if (existingManager) {
          hiringManager = existingManager;
          return;
        }

        return createEmployeeViaApi().then((employee) => {
          hiringManagerEmpNumber = employee.empNumber;
          return listHiringManagers().then((availableManagers) => {
            const createdManager = availableManagers.find(
              (availableManager) => availableManager.empNumber === employee.empNumber,
            );
            if (!createdManager) {
              throw new Error(
                'Cannot run vacancy filters: the created employee is not available as a hiring manager.',
              );
            }
            hiringManager = createdManager;
          });
        });
      });
    }).then(() => {
      vacanciesPage.addVacancy(vacancyName, jobTitle.title, hiringManager);
    });
  });

  afterEach(() => {
    return deleteVacancyByName(vacancyName)
      .then(() =>
        hiringManagerEmpNumber === undefined
          ? cy.wrap(null, { log: false })
          : deleteEmployeeViaApi(hiringManagerEmpNumber),
      );
  });

  it('filters a created vacancy by its name and job title, then restores the full list', () => {
    vacanciesPage.getRecordsSummary().as('initialResults');
    vacanciesPage.selectFilter('Vacancy', vacancyName);
    vacanciesPage.selectFilter('Job Title', jobTitle.title);
    vacanciesPage.search();
    vacanciesPage.getVisibleTableRows().should('have.length', 1);
    vacanciesPage.assertEveryVisibleRowContains(vacancyName);
    vacanciesPage.assertEveryVisibleRowContains(jobTitle.title);
    vacanciesPage.assertEveryVisibleRowContains('Active');

    vacanciesPage.reset();
    cy.get<string>('@initialResults').then((initialResults) => {
      vacanciesPage.getRecordsSummary().should((restoredResults) => {
        expect(restoredResults.replace(/\s+/g, ' ')).to.eq(
          initialResults.replace(/\s+/g, ' '),
        );
      });
    });
  });

  it('returns no records for a closed created vacancy and restores the full list', () => {
    vacanciesPage.getRecordsSummary().as('initialResults');
    vacanciesPage.selectFilter('Vacancy', vacancyName);
    vacanciesPage.selectFilter('Status', 'Closed');
    vacanciesPage.search();
    vacanciesPage.assertNoRecords();

    vacanciesPage.reset();
    cy.get<string>('@initialResults').then((initialResults) => {
      vacanciesPage.getRecordsSummary().should((restoredResults) => {
        expect(restoredResults.replace(/\s+/g, ' ')).to.eq(
          initialResults.replace(/\s+/g, ' '),
        );
      });
    });
  });
});
