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

  if (totalTests === 0 || totalFailed > 0 || totalPending > 0 || totalSkipped > 0) {
    throw new Error('CI requires at least one E2E test and does not allow failed or skipped tests.');
  }
}

runCypress().catch((caughtError) => {
  error(caughtError);
  process.exitCode = 1;
});
