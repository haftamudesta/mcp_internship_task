/// <reference types="cypress" />

describe('Timer Logic E2E Tests', () => {
  let authToken: string;
  const testEmail = `timer_test_${Date.now()}@example.com`;

  before(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: {
        email: testEmail,
        password: 'Password123',
        name: 'Timer Test User',
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
        name: `Timer Product ${Date.now()}`,
        description: 'Product for testing timer',
        price: 99.99,
        totalStock: 10,
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

  it('should display products page', () => {
    cy.get('h1').should('contain', 'Limited Drops');
  });

  it('should create a reservation', () => {
    cy.contains('button', 'Reserve Now').first().click();
    cy.contains('button', 'Cancel', { timeout: 15000 }).should('be.visible');
  });

  it('should show timer after reservation', () => {
    cy.contains('button', 'Reserve Now').first().click();
    cy.contains('button', 'Cancel', { timeout: 15000 }).should('be.visible');
    cy.get('.bg-blue-50').should('be.visible');
  });
});