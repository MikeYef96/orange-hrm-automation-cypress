# OrangeHRM Cypress Automation

Maintainable end-to-end automation for the public OrangeHRM demo, built with Cypress, TypeScript, page objects, Faker, and Mochawesome reporting.

## Technology

- Cypress 16 with TypeScript 5.8 (strict type checking)
- Page Object Model for application interactions
- `@faker-js/faker` for unique test records and upload content
- `dotenv` for local credentials
- `cypress-mochawesome-reporter` for HTML reports
- ESLint with the TypeScript ESLint recommended rules
- Prettier for consistent formatting

## Prerequisites

- Node.js and npm versions supported by Cypress 16
- Google Chrome installed for headless and headed test commands (Cypress also bundles Electron, but it is deprecated as a test browser)
- Access to `https://opensource-demo.orangehrmlive.com/`

## Installation and configuration

```bash
npm install
npm run prepare
```

On Windows PowerShell, create the local environment file with `Copy-Item .env.example .env` (or use `cp .env.example .env` on macOS/Linux).

Set the following values in `.env`:

```dotenv
CYPRESS_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_USERNAME=your-demo-username
ORANGEHRM_PASSWORD=your-demo-password
```

Credentials are read from the environment, not embedded in test code. Successful login and logout require both configured credentials. The invalid-password cases require the configured username for one case and intentionally submit an incorrect password; the empty-form check needs no credentials.

## Running tests

| Command                    | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `npm test`                 | Run all specs headlessly in Chrome                       |
| `npm run cypress:run`      | Run all specs headlessly in Chrome                       |
| `npm run test:ci`          | Run all specs; fail if none, pending, skipped, or failed |
| `npm run test:headed`      | Run all specs in visible Chrome                          |
| `npm run cypress:open`     | Open the Cypress interactive runner                      |
| `npm run test:login`       | Run login tests                                          |
| `npm run test:users`       | Run user-management tests                                |
| `npm run test:attachments` | Run attachment tests                                     |
| `npm run test:dashboard`   | Run dashboard tests                                      |
| `npm run test:vacancies`   | Run recruitment/vacancies tests                          |
| `npm run format`           | Format supported project files with Prettier             |
| `npm run format:check`     | Check formatting without modifying files                 |
| `npm run typecheck`        | Type-check without emitting files                        |
| `npm run lint`             | Run ESLint                                               |
| `npm run validate`         | Run TypeScript, ESLint, and Prettier checks              |
| `npm run report:open`      | Open the generated HTML report                           |

The self-contained HTML report is written under `cypress/reports/html/` after a Cypress run. Mochawesome copies Cypress videos into `cypress/reports/html/videos/`. Only after the reporter's awaited `after:run` hook completes successfully are source videos removed; if report generation or copying fails, the hook fails and the source videos remain available for recovery. Missing or empty source folders are safe to clean up. Cypress's `trashAssetsBeforeRuns` setting clears previous run assets, and Mochawesome replaces its report output before a normal run to prevent stale videos and reports. CI uploads this directory as the `cypress-report` workflow artifact. After successful tests on `main`, CI also publishes only this directory to GitHub Pages.

## Local Git checks

Husky installs Git hooks when dependencies are installed. Before each commit, the `pre-commit` hook runs `npm run validate` (TypeScript, ESLint, and Prettier). Cypress E2E tests are not run automatically during commit or push; run them manually with `npm test` when needed. Pull requests targeting `main` run the configured CI checks and E2E tests; the workflow fails if its required credentials are unavailable.

## Continuous integration

GitHub Actions runs TypeScript checking, ESLint, Prettier formatting validation, and Cypress E2E tests on pushes to `main`, pull requests targeting `main`, and manual dispatches. Feature-branch changes are checked when their pull request targets `main`; feature-branch pushes do not trigger separate CI runs. Add the repository secrets `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` under **Settings → Secrets and variables → Actions**. `CYPRESS_BASE_URL` is an optional override; it defaults to the OrangeHRM demo URL. CI fails explicitly if credentials are unavailable, and the CI runner fails if Cypress reports zero tests, pending tests, skipped tests, or failures. This also means fork pull requests without secrets cannot complete the required workflow. The HTML report is uploaded as a workflow artifact when a Cypress run generates it.

To publish reports, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow deploys only after all checks pass on `main` (push or manual dispatch), never from pull requests. It publishes `cypress/reports/html/`, including the archived test videos under `videos/`; raw screenshots, environment files, and logs are not included. GitHub Pages may be public, so keep test data and report output—including videos—free of personal or sensitive information. The deployment job alone receives the Pages write and OIDC permissions.

## Project structure

```text
cypress/
  e2e/                 Feature-oriented test suites
  fixtures/            Static data-driven test cases
  pages/               Page Objects and reusable UI interactions
  support/             Cypress commands, support setup, and types
  utils/               Test data and API helpers
cypress.config.ts       Cypress, environment, and reporting setup
eslint.config.mjs       Lightweight TypeScript lint configuration
tsconfig.json           Strict TypeScript compiler settings
```

## Architecture and data strategy

- Page Objects encapsulate selectors and user interactions; route-based pages share a `NavigablePage` lifecycle for `visit()` and keep their own page-specific `assertLoaded()` checks. Menu/section objects remain on `BasePage`; test assertions stay in specs wherever practical.
- `cy.loginAsAdmin()` caches an authenticated session and validates that it remains usable.
- Faker generates unique usernames, employee details, passwords, attachment names, descriptions, and file content.
- Login failure examples live in `cypress/fixtures/users.json`.
- Each user-management test creates a unique employee through the authenticated application API and creates its own ESS user. Creation, role update, status update, and deletion are independently verified; API teardown runs after the test, including when a UI action or assertion fails.
- Each vacancy test creates its own vacancy using real job-title and hiring-manager data, verifies an independent filter scenario, and cleans up the vacancy and any API-created hiring manager.
- Attachment upload/listing, download/content verification, and deletion are separate tests. Each test uploads its own uniquely named attachment and uses API teardown to remove it even when the test fails.
- Dashboard tests validate Sub Unit and Location API response shapes, unique categories, and non-negative integer counts, then compare the rendered chart legends with the categories and conditional `Other`/`Unassigned` labels derived from the responses. They do not hardcode volatile counts or labels.

## Cleanup and diagnostics

User-management, attachment, and vacancy specs return API cleanup chains from `afterEach`, including after a UI assertion fails. Cleanup accepts an already-absent record but fails explicitly on other unexpected API statuses. Upload fixtures are generated in memory; downloaded content is compared directly, so test runs do not accumulate temporary upload/download files. Mochawesome archives videos before the source folder is removed; its successful awaited report hook confirms the copy completed, and its normal output cleanup prevents stale videos between runs. Videos, screenshots, and reports are ignored by Git.

## Scenarios covered

- Login success, invalid password, required-field validation, and logout
- Independent ESS user creation and search, role update to Admin, status update to Disabled, and deletion/absence-from-search scenarios
- Independent text attachment upload/listing, exact downloaded-content and response-type checks, and deletion scenarios
- Dashboard Sub Unit and Location API data, count validity, rendered chart dimensions, response-matched legends, and negative checks for missing, duplicate, or unexpected labels
- Independent vacancy filtering by name/job title and no-match filtering by its opposite status, with reset verification

## Known limitations and assumptions

- The OrangeHRM demo is a shared public environment. It may be temporarily unavailable, rate-limited, or changed independently of this project.
- The public demo emits a specific unhandled request-rejection during logout navigation; only that exact error is ignored in the logout test, while the redirect and login-page assertions still have to pass.
- Valid credentials must be supplied through `.env`; credentials are not committed. The UI publicly displays demo credentials, but this framework deliberately leaves them configurable.
- User and attachment cleanup uses the demo application's current API endpoints and can be affected by upstream changes or server errors.
- Vacancy tests create their own uniquely named record using real job-title and manager options, so they do not depend on pre-existing vacancies. The shared demo's available job titles and hiring managers can change; if either list is empty, the test fails with the missing prerequisite rather than passing as pending. Cleanup uses the demo API and can be affected by upstream changes.
- Attachment download verification obtains the URL triggered by the UI and compares the downloaded text response and MIME type with the generated in-memory fixture. A server-side download/API change may require updating that flow.
- Dashboard chart series are dynamic; tests validate the API-provided counts and categories against the rendered legends without hardcoding changing values. The demo renders chart values on canvas, so the suite does not attempt brittle pixel- or hover-based numeric comparisons.
- The project uses no fixed sleeps; Cypress retries UI assertions and waits for loading indicators where applicable.

## Future improvements

- Run CI against a controlled OrangeHRM instance with seeded, disposable data for more predictable end-to-end runs.
- Add API contract checks and stronger response typing for the demo API.
- Add cross-browser execution and historical report retention in CI.
