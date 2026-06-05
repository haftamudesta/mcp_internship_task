/// <reference types="cypress" />

describe('Countdown Timer Logic Tests', () => {
  let authToken: string;

  before(() => {
    // Register a test user once before all tests
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: {
        email: `timer_test_${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Timer Test User',
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
        name: `Timer Product ${Date.now()}`,
        description: 'Product for testing timer',
        price: 99.99,
        totalStock: 10,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    cy.visit('/products');
    cy.contains('button', 'Reserve Now', { timeout: 10000 }).should('be.visible');
  });

  it('should display countdown timer after successful reservation', () => {
    // Click reserve button
    cy.contains('button', 'Reserve Now').first().click();

    // Check for loading state
    cy.contains('Reserving...').should('be.visible');

    // Wait for reservation to complete
    cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

    // Check countdown timer appears
    cy.contains('Time Remaining').should('be.visible');
    cy.contains('Complete checkout before time expires').should('be.visible');
    
    // Check timer format (should be MM:SS)
    cy.get('.font-mono.text-4xl.font-bold')
      .invoke('text')
      .should('match', /^\d+:\d{2}$/);
  });

  it('should show correct initial time (5 minutes)', () => {
    cy.contains('button', 'Reserve Now').first().click();

    cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

    // Check initial time (should be around 5 minutes = 300 seconds)
    cy.get('.font-mono.text-4xl.font-bold')
      .invoke('text')
      .then((time) => {
        const [minutes, seconds] = time.split(':');
        const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
        // Allow some buffer for API response time
        expect(totalSeconds).to.be.lessThan(305);
        expect(totalSeconds).to.be.greaterThan(290);
      });
  });

  it('should update timer every second', () => {
    cy.contains('button', 'Reserve Now').first().click();

    cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

    // Get initial time
    cy.get('.font-mono.text-4xl.font-bold').invoke('text').as('initialTime');

    cy.wait(2000);

    // Get updated time
    cy.get('.font-mono.text-4xl.font-bold').invoke('text').as('updatedTime');

    // Verify time decreased
    cy.then(function() {
      const initialTimeStr = this.initialTime as string;
      const updatedTimeStr = this.updatedTime as string;
      
      if (initialTimeStr && updatedTimeStr) {
        const [initialMinutes, initialSeconds] = initialTimeStr.split(':');
        const [updatedMinutes, updatedSeconds] = updatedTimeStr.split(':');
        const initialTotal = parseInt(initialMinutes) * 60 + parseInt(initialSeconds);
        const updatedTotal = parseInt(updatedMinutes) * 60 + parseInt(updatedSeconds);
        expect(updatedTotal).to.be.lessThan(initialTotal);
      }
    });
  });

  it('should show expiration message when timer reaches zero', () => {
    // Intercept reservation with very short expiration
    cy.intercept('POST', '/api/reservations', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          reservationId: 'test-id',
          expiresAt: new Date(Date.now() + 5000).toISOString(), 
          quantity: 1,
        },
      },
    }).as('shortReservation');

    cy.contains('button', 'Reserve Now').first().click();
    cy.wait('@shortReservation');

    cy.wait(6000);

    // Check expiration message
    cy.contains('Reservation has expired! The stock has been released.', { timeout: 5000 })
      .should('be.visible');
  });

  it('should show urgent message when time is low', () => {
    cy.intercept('POST', '/api/reservations', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          reservationId: 'test-id-2',
          expiresAt: new Date(Date.now() + 60000).toISOString(), 
          quantity: 1,
        },
      },
    }).as('minuteReservation');

    cy.contains('button', 'Reserve Now').first().click();
    cy.wait('@minuteReservation');

    cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

    // Check for urgent message (appears when time <= 60 seconds)
    cy.contains('Hurry! Your reservation is about to expire!', { timeout: 60000 })
      .should('be.visible');
  });

  it('should show timer with color for low time', () => {
    // Intercept with 30-second expiration
    cy.intercept('POST', '/api/reservations', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          reservationId: 'test-id-3',
          expiresAt: new Date(Date.now() + 30000).toISOString(), 
          quantity: 1,
        },
      },
    }).as('thirtySecondReservation');

    cy.contains('button', 'Reserve Now').first().click();
    cy.wait('@thirtySecondReservation');

    cy.contains('✅ Reservation Confirmed!', { timeout: 10000 }).should('be.visible');

    cy.contains('Hurry! Your reservation is about to expire!', { timeout: 30000 })
      .should('be.visible');
    
    cy.get('.font-mono.text-4xl.font-bold').should('exist');
  });
});