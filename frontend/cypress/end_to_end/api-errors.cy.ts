/// <reference types="cypress" />

describe('API Error Handling Tests', () => {
  let authToken: string;

  before(() => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: {
        email: `error_test_${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Error Test User',
      },
    }).then((response) => {
      authToken = response.body.data.token;
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', authToken);
      });
    });
  });

  beforeEach(() => {
    // Create a fresh product for each test
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

    cy.visit('/products');
    cy.contains('button', 'Reserve Now', { timeout: 10000 }).should('be.visible');
  });

  describe('Network Error Handling', () => {
    it('should handle network error during reservation', () => {
      cy.intercept('POST', '/api/reservations', {
        forceNetworkError: true,
      }).as('networkError');

      cy.contains('button', 'Reserve Now').first().click();

      cy.contains('Network error', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Insufficient Stock Handling', () => {
    it('should show error when product is out of stock', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/products',
        body: {
          name: 'Out of Stock Product',
          description: 'No stock available',
          price: 49.99,
          totalStock: 0,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      cy.visit('/products');
      cy.contains('Out of Stock Product')
        .parents('.card')
        .find('button')
        .should('be.disabled');
      
      cy.contains('Out of Stock Product')
        .parents('.card')
        .find('button')
        .should('contain', 'Sold Out');
    });

    it('should show insufficient stock error on reservation', () => {
      cy.intercept('POST', '/api/reservations', {
        statusCode: 409,
        body: {
          success: false,
          error: 'Insufficient stock',
          message: 'Sorry, this item is no longer in stock.',
        },
      }).as('insufficientStock');

      cy.contains('button', 'Reserve Now').first().click();

      cy.contains('Sorry, this item is no longer in stock.', { timeout: 5000 })
        .should('be.visible');
    });
  });

  describe('Duplicate Reservation Handling', () => {
    it('should prevent duplicate reservations', () => {
      // First reservation (successful)
      cy.contains('button', 'Reserve Now').first().click();

      cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

      // After successful reservation, the Reserve Now button should be gone
      cy.contains('button', 'Reserve Now').should('not.exist');
      
      // Checkout and Cancel buttons should appear
      cy.contains('Complete Checkout').should('be.visible');
      cy.contains('Cancel').should('be.visible');
    });
  });
});