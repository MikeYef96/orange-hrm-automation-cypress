import { defineConfig } from 'cypress';
import { config as loadEnv } from 'dotenv';
import mochawesomeReporter from 'cypress-mochawesome-reporter/plugin';

loadEnv();

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 60000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  downloadsFolder: 'cypress/downloads',
  screenshotOnRunFailure: true,
  video: true,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'OrangeHRM Cypress Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: 'cypress/reports/html',
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      mochawesomeReporter(on);
      config.env.username = process.env.ORANGEHRM_USERNAME ?? config.env.username;
      config.env.password = process.env.ORANGEHRM_PASSWORD ?? config.env.password;
      return config;
    },
  },
  env: {
    username: process.env.ORANGEHRM_USERNAME ?? '',
    password: process.env.ORANGEHRM_PASSWORD ?? '',
  },
});
