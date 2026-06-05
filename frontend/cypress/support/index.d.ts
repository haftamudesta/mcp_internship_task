/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login a user
     * @example cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
    
    /**
      @example cy.createProduct({ name: 'Test Product', description: '...', price: 99.99, totalStock: 10 })
     */
    createProduct(product: {
      name: string;
      description: string;
      price: number;
      totalStock: number;
    }): Chainable<void>;
    
    /**
     * Custom command to create a reservation
     * @example cy.createReservation('product-id')
     */
    createReservation(productId: string): Chainable<any>;
    
    /**
     * Custom command to mock API responses
     * @example cy.mockApi('POST', '/api/products', { data: {...} })
     */
    mockApi(method: string, url: string, response: any): Chainable<void>;
  }
}