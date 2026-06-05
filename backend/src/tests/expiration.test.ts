import { prisma } from '../lib/prisma';
import { ReservationService } from '../services/ReservationService';
import { AuthService } from '../services/AuthService';
import { TestUser, TestProduct } from './test.types';

describe('Expiration Logic Tests', () => {
  let reservationService: ReservationService;
  let authService: AuthService;
  let testUser: TestUser;
  let testProduct: TestProduct;

  beforeAll(async () => {
    reservationService = new ReservationService();
    authService = new AuthService();
  });

  beforeEach(async () => {
    const registerResult = await authService.register('test@example.com', 'password123', 'Test User');
    testUser = {
      user: registerResult.user,
      token: registerResult.token,
    };
    
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        totalStock: 10,
        availableStock: 10,
      },
    });
    
    testProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  });

  describe('expireReservations', () => {
    it('should expire reservations that have passed their expiration time', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      const expiredReservation = await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 2,
          status: 'ACTIVE',
          expiresAt: pastDate,
        },
      });

      const expiredCount = await reservationService.expireReservations();
      
      expect(expiredCount).toBe(1);
      
      const updatedReservation = await prisma.reservation.findUnique({
        where: { id: expiredReservation.id },
      });
      expect(updatedReservation?.status).toBe('EXPIRED');
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(10);
    });

    it('should not expire active reservations that are still valid', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      
      await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 1,
          status: 'ACTIVE',
          expiresAt: futureDate,
        },
      });

      const expiredCount = await reservationService.expireReservations();
      
      expect(expiredCount).toBe(0);
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(9);
    });

    it('should handle multiple expired reservations', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 1,
          status: 'ACTIVE',
          expiresAt: pastDate,
        },
      });
      
      await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 1,
          status: 'ACTIVE',
          expiresAt: pastDate,
        },
      });

      const expiredCount = await reservationService.expireReservations();
      
      expect(expiredCount).toBe(2);
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(10);
    });
  });
});