import './commands';
import { mount } from '@cypress/react';

// Add mount command
Cypress.Commands.add('mount', mount);

// Type declaration for mount
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}