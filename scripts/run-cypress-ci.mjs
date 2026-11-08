import { error, log } from 'node:console';
import process from 'node:process';
import cypress from 'cypress';

async function runCypress() {
  const result = await cypress.run({ browser: 'chrome' });

  if (result.status === 'failed') {
    throw new Error(`Cypress could not run: ${result.message}`);
  }

  const { totalFailed, totalPending, totalSkipped, totalTests } = result;
  log(
    `Cypress results: ${totalTests} tests, ${totalFailed} failed, ${totalPending} pending, ${totalSkipped} skipped.`,
  );

  if (totalTests === 0) {
    throw new Error('CI requires at least one E2E test; Cypress reported zero tests.');
  }
  if (totalFailed > 0) {
    throw new Error(`CI does not allow failed E2E tests; Cypress reported ${totalFailed} failure(s).`);
  }
  if (totalPending > 0 || totalSkipped > 0) {
    throw new Error(
      `CI does not allow pending or skipped E2E tests; Cypress reported ${totalPending} pending and ${totalSkipped} skipped.`,
    );
  }
}

runCypress().catch((caughtError) => {
  error(caughtError);
  process.exitCode = 1;
});
