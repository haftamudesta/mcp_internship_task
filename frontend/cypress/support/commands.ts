/// <reference types="cypress" />

//Create Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('auth_token', response.body.data.token);
  });
});

// Create product command
Cypress.Commands.add('createProduct', (product: {
  name: string;
  description: string;
  price: number;
  totalStock: number;
}) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/products',
    body: product,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
  });
});

// Create reservation command
Cypress.Commands.add('createReservation', (productId: string) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/reservations',
    body: { productId, quantity: 1 },
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
  }).then((response) => {
    return response.body.data;
  });
});

// Mock API command 
Cypress.Commands.add('mockApi', (method: string, url: string, response: any) => {
  cy.intercept({
    method: method as any,
    url: url,
  }, response);
});