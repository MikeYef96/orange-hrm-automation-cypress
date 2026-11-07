import { RecruitmentPage } from '../../pages/RecruitmentPage';
import { VacanciesPage } from '../../pages/VacanciesPage';
import { deleteVacancyByName, listHiringManagers, listJobTitles } from '../../utils/apiClient';
import { createVacancyName } from '../../utils/testData';

const recruitmentPage = new RecruitmentPage();
const vacanciesPage = new VacanciesPage();

describe('Recruitment — Job Vacancies', () => {
  let vacancyName: string;

  beforeEach(() => {
    vacancyName = createVacancyName();
    cy.loginAsAdmin();
    cy.visit('/web/index.php/dashboard/index');
    recruitmentPage.openVacancies();
    vacanciesPage.assertLoaded();
  });

  afterEach(() => {
    return deleteVacancyByName(vacancyName);
  });

  it('creates a vacancy, filters it, verifies no-match, then restores the full list', () => {
    listJobTitles().then((jobTitles) => {
      const jobTitle = jobTitles[0];
      if (!jobTitle) {
        throw new Error('Cannot run vacancy filters: the demo has no job titles available.');
      }

      listHiringManagers().then((managers) => {
        const manager = managers[0];
        if (!manager) {
          throw new Error('Cannot run vacancy filters: the demo has no hiring managers available.');
        }

        vacanciesPage.addVacancy(vacancyName, jobTitle.title, manager);
        vacanciesPage.getRecordsSummary().as('initialResults');

        vacanciesPage.selectFilter('Vacancy', vacancyName);
        vacanciesPage.selectFilter('Job Title', jobTitle.title);
        vacanciesPage.search();
        vacanciesPage.getVisibleTableRows().should('have.length', 1);
        vacanciesPage.assertEveryVisibleRowContains(vacancyName);
        vacanciesPage.assertEveryVisibleRowContains(jobTitle.title);
        vacanciesPage.assertEveryVisibleRowContains('Active');

        vacanciesPage.reset();
        vacanciesPage.selectFilter('Vacancy', vacancyName);
        vacanciesPage.selectFilter('Status', 'Closed');
        vacanciesPage.search();
        vacanciesPage.assertNoRecords();

        vacanciesPage.reset();
        cy.get<string>('@initialResults').then((initialResults) => {
          vacanciesPage.getRecordsSummary().should((restoredResults) => {
            expect(restoredResults.replace(/\s+/g, ' ')).to.eq(initialResults.replace(/\s+/g, ' '));
          });
        });
      });
    });
  });
});
