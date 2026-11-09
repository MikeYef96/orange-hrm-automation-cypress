import { defineConfig } from 'cypress';
import { rm } from 'node:fs/promises';
import path from 'node:path';
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
  trashAssetsBeforeRuns: true,
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
      const videosDirectory = path.resolve(config.projectRoot, config.videosFolder);
      const reporterEvents = new Proxy(on, {
        apply(target, thisArg, args) {
          if (args[0] === 'after:run') {
            const reporterAfterRun = args[1] as (
              results:
                CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult,
            ) => void | Promise<void>;
            return target('after:run', async (results) => {
              // Keep source videos if Mochawesome report generation or copying fails.
              await reporterAfterRun(results);
              await rm(videosDirectory, { recursive: true, force: true });
            });
          }

          return Reflect.apply(target, thisArg, args);
        },
      });
      mochawesomeReporter(reporterEvents);
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
