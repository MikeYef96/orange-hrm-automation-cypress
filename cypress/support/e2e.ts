import 'cypress-mochawesome-reporter/register';
import './commands';

Cypress.on('uncaught:exception', (error) => {
  if (!error.message.includes("Cannot read properties of undefined (reading 'response')")) {
    return;
  }

  Cypress.log({
    name: 'OrangeHRM request rejection',
    message: 'Ignored the demo app request rejection during logout navigation.',
  });
  return false;
});
