import './commands';
import '@testing-library/cypress/add-commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Global before each hook
beforeEach(() => {
  // Clear localStorage before each test
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});