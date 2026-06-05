/// <reference types="cypress" />

describe('API Error Handling E2E Tests', () => {
  let authToken: string;
  const testEmail = `error_test_${Date.now()}@example.com`;

  before(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: {
        email: testEmail,
        password: 'Password123',
        name: 'Error Test User',
      },
    }).then((response) => {
      authToken = response.body.data.token;
    });
  });

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/products',
      body: {
        name: `Error Product ${Date.now()}`,
        description: 'Product for testing errors',
        price: 99.99,
        totalStock: 5,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', authToken);
    });
    
    cy.visit('/products');
    cy.wait(2000);
  });

  it('should handle network error', () => {
    cy.intercept('POST', '/api/reservations', {
      forceNetworkError: true,
    });

    cy.contains('button', 'Reserve Now').first().click();
    cy.contains('Network error', { timeout: 10000 }).should('be.visible');
  });
});