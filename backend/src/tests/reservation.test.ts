import { prisma } from '../lib/prisma';
import { ReservationService } from '../services/ReservationService';
import { AuthService } from '../services/AuthService';
import { TestUser, TestProduct } from './test.types';

describe('Reservation Logic Tests', () => {
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

  describe('createReservation', () => {
    it('should create a reservation successfully', async () => {
      const reservation = await reservationService.createReservation(
        testUser.user.id,
        testProduct.id,
        1
      );

      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
      expect(reservation.quantity).toBe(1);
      expect(reservation.status).toBe('ACTIVE');
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(9);
    });

    it('should throw error when product not found', async () => {
      await expect(
        reservationService.createReservation(
          testUser.user.id,
          'non-existent-id',
          1
        )
      ).rejects.toThrow('Product not found');
    });

    it('should throw error when insufficient stock', async () => {
      await expect(
        reservationService.createReservation(
          testUser.user.id,
          testProduct.id,
          20
        )
      ).rejects.toThrow('Insufficient stock');
    });

    it('should prevent duplicate active reservations', async () => {
      await reservationService.createReservation(
        testUser.user.id,
        testProduct.id,
        1
      );

      await expect(
        reservationService.createReservation(
          testUser.user.id,
          testProduct.id,
          1
        )
      ).rejects.toThrow('Active reservation already exists');
    });
  });

  describe('checkoutReservation', () => {
    it('should successfully checkout a reservation', async () => {
      const reservation = await reservationService.createReservation(
        testUser.user.id,
        testProduct.id,
        1
      );

      const order = await reservationService.checkoutReservation(reservation.id);
      
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.status).toBe('COMPLETED');
      
      const updatedReservation = await prisma.reservation.findUnique({
        where: { id: reservation.id },
      });
      expect(updatedReservation?.status).toBe('COMPLETED');
      
      const orders = await prisma.order.findMany({
        where: { userId: testUser.user.id },
      });
      expect(orders.length).toBe(1);
    });

    it('should throw error for non-existent reservation', async () => {
      await expect(
        reservationService.checkoutReservation('non-existent-id')
      ).rejects.toThrow('Reservation not found');
    });

    it('should throw error for expired reservation', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      const reservation = await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 1,
          status: 'ACTIVE',
          expiresAt: pastDate,
        },
      });

      await expect(
        reservationService.checkoutReservation(reservation.id)
      ).rejects.toThrow('Reservation has expired');
    });
  });
});