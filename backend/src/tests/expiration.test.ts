import { prisma } from '../lib/prisma';
import { ReservationService } from '../services/ReservationService';
import { AuthService } from '../services/AuthService';

describe('Expiration Logic Tests', () => {
  let reservationService: ReservationService;
  let authService: AuthService;

  beforeAll(async () => {
    reservationService = new ReservationService();
    authService = new AuthService();
  });

  beforeEach(async () => {
    await prisma.inventoryLog.deleteMany();
    await prisma.order.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('expireReservations', () => {
    it('should expire reservations that have passed their expiration time', async () => {
      const uniqueEmail = `test_${Date.now()}_${Math.random()}@example.com`;
      const registerResult = await authService.register(uniqueEmail, 'password123', 'Test User');
      const testUser = registerResult;
      
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          totalStock: 10,
          availableStock: 10,
        },
      });

      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      // Create expired reservation (this directly creates an expired reservation in DB)
      // Note: This bypasses the service to test the expiration logic directly
      await prisma.reservation.create({
        data: {
          userId: testUser.user.id,
          productId: testProduct.id,
          quantity: 2,
          status: 'ACTIVE',
          expiresAt: pastDate,
        },
      });
      
      // Stock should still be 10 because we didn't decrease it manually
      // The expiration job will restore stock, but since we never decreased it, 
      // we need to decrease it first to simulate a real scenario
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { availableStock: 8 }, // Decrease stock by 2 to simulate reservation
      });

      const expiredCount = await reservationService.expireReservations();
      
      expect(expiredCount).toBe(1);
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      // Stock should be restored to 10
      expect(updatedProduct?.availableStock).toBe(10);
    });

    it('should not expire active reservations that are still valid', async () => {
      const uniqueEmail = `test_${Date.now()}_${Math.random()}@example.com`;
      const registerResult = await authService.register(uniqueEmail, 'password123', 'Test User');
      const testUser = registerResult;
      
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          totalStock: 10,
          availableStock: 10,
        },
      });

      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      
      // Create valid reservation using service (this will decrease stock)
      const reservation = await reservationService.createReservation(
        testUser.user.id,
        testProduct.id,
        1
      );
      
      expect(reservation).toBeDefined();

      const expiredCount = await reservationService.expireReservations();
      
      expect(expiredCount).toBe(0);
      
      // Stock should remain decreased (9)
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(9);
    });

    it('should handle multiple expired reservations', async () => {
      const uniqueEmail = `test_${Date.now()}_${Math.random()}@example.com`;
      const registerResult = await authService.register(uniqueEmail, 'password123', 'Test User');
      const testUser = registerResult;
      
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          totalStock: 10,
          availableStock: 10,
        },
      });

      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      // Create two expired reservations
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
      
      // Decrease stock by 2
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { availableStock: 8 },
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