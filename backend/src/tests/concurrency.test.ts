import { prisma } from '../lib/prisma';
import { ReservationService } from '../services/ReservationService';
import { AuthService } from '../services/AuthService';

describe('Concurrency Simulation Tests', () => {
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

  describe('Concurrent Reservation Creation', () => {
    it('should handle concurrent reservation attempts correctly', async () => {
      // Create product with limited stock
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          totalStock: 5,
          availableStock: 5,
        },
      });

      const numberOfAttempts = 10;
      const promises: Promise<any>[] = [];
      let successCount = 0;
      let failCount = 0;

      // Create different users for each attempt
      for (let i = 0; i < numberOfAttempts; i++) {
        const uniqueEmail = `user_${Date.now()}_${i}_${Math.random()}@example.com`;
        
        const registerResult = await authService.register(uniqueEmail, 'password123', `User ${i}`);
        const userId = registerResult.user.id;
        
        const promise = reservationService
          .createReservation(userId, testProduct.id, 1)
          .then(() => { successCount++; })
          .catch((err) => { 
            failCount++; 
            return null;
          });
        
        promises.push(promise);
      }

      await Promise.all(promises);

      // Only 5 should succeed (because stock is 5)
      expect(successCount).toBe(5);
      expect(failCount).toBe(5);
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(0);
    });

    it('should handle race condition for last item', async () => {
      // Set stock to 1
      const testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          totalStock: 1,
          availableStock: 1,
        },
      });

      const numberOfAttempts = 20;
      const promises: Promise<any>[] = [];
      let successCount = 0;

      // Create different users for each attempt
      for (let i = 0; i < numberOfAttempts; i++) {
        const uniqueEmail = `user_${Date.now()}_${i}_${Math.random()}@example.com`;
        
        const registerResult = await authService.register(uniqueEmail, 'password123', `User ${i}`);
        const userId = registerResult.user.id;
        
        const promise = reservationService
          .createReservation(userId, testProduct.id, 1)
          .then(() => { successCount++; })
          .catch(() => {});
        
        promises.push(promise);
      }

      await Promise.all(promises);

      // Only 1 should succeed
      expect(successCount).toBe(1);
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct?.availableStock).toBe(0);
    });
  });
});