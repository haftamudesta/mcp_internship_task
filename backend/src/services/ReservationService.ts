import { prisma } from '../lib/prisma';
import { ReservationStatus, ChangeType } from '@prisma/client';
import { ProductRepository } from '../repositories/ProductRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { InventoryLogRepository } from '../repositories/InventoryLogRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { CreateReservationResult, CheckoutResult, Reservation } from '../types';
import { logger } from '../utils/logger';
import { metricsCollector } from '../utils/metrics';

const productRepo = new ProductRepository();
const reservationRepo = new ReservationRepository();
const inventoryLogRepo = new InventoryLogRepository();
const orderRepo = new OrderRepository();

export class ReservationService {
  async createReservation(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CreateReservationResult> {
    const fiveMinutesLater = new Date();
    fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(async (tx) => {
        const product = await productRepo.findByIdWithLock(productId, tx);
        
        if (!product) {
          throw new Error('Product not found');
        }

        if (product.availableStock < quantity) {
          metricsCollector.incrementFailedReservations();
          throw new Error('Insufficient stock');
        }

        const existingReservation = await reservationRepo.findActiveByUserAndProduct(
          userId,
          productId,
          tx
        );

        if (existingReservation) {
          throw new Error('Active reservation already exists for this product');
        }

        const updatedProduct = await productRepo.decrementStockWithTransaction(
          productId,
          quantity,
          tx
        );

        const reservation = await reservationRepo.create(
          {
            userId,
            productId,
            quantity,
            expiresAt: fiveMinutesLater
          },
          tx
        );

        await inventoryLogRepo.create(
          {
            productId,
            changeType: ChangeType.RESERVATION_CREATE,
            quantity,
            oldStock: product.availableStock,
            newStock: updatedProduct.availableStock,
            reason: `Reservation created: ${reservation.id}`,
            metadata: { reservationId: reservation.id, userId }
          },
          tx
        );

        metricsCollector.incrementActiveReservations();

        return reservation;
      });

      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.info(`Reservation created successfully: ${result.id}`, { userId, productId, quantity });

      return {
        id: result.id,
        expiresAt: result.expiresAt,
        quantity: result.quantity,
        status: result.status
      };
    } catch (error) {
      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.error('Failed to create reservation', { error, userId, productId, quantity });
      throw error;
    }
  }

  async checkoutReservation(reservationId: string): Promise<CheckoutResult> {
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(async (tx) => {
        const reservation = await reservationRepo.findById(reservationId, tx);

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.ACTIVE) {
          throw new Error(`Reservation is ${reservation.status.toLowerCase()}`);
        }

        if (reservation.expiresAt < new Date()) {
          throw new Error('Reservation has expired');
        }

        const product = await productRepo.findByIdWithLock(reservation.productId, tx);
        if (!product) {
          throw new Error('Product not found');
        }

        const order = await orderRepo.create(
          {
            userId: reservation.userId,
            productId: reservation.productId,
            reservationId: reservation.id,
            quantity: reservation.quantity,
            totalAmount: Number(product.price) * reservation.quantity,
            status: 'COMPLETED'
          },
          tx
        );

        await reservationRepo.updateStatus(reservationId, ReservationStatus.COMPLETED, tx);

        await inventoryLogRepo.create(
          {
            productId: reservation.productId,
            changeType: ChangeType.RESERVATION_COMPLETE,
            quantity: reservation.quantity,
            oldStock: product.availableStock,
            newStock: product.availableStock,
            reason: `Reservation completed: ${reservation.id}`,
            metadata: { reservationId, orderId: order.id }
          },
          tx
        );

        metricsCollector.incrementTotalCheckouts();
        metricsCollector.decrementActiveReservations();

        return order;
      });

      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.info(`Checkout completed successfully: ${result.id}`, { reservationId });

      return {
        id: result.id,
        status: result.status,
        totalAmount: Number(result.totalAmount)
      };
    } catch (error) {
      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.error('Checkout failed', { error, reservationId });
      throw error;
    }
  }

  async getUserActiveReservations(userId: string): Promise<Reservation[]> {
    return reservationRepo.findActiveByUser(userId);
  }

  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(async (tx) => {
        const reservation = await reservationRepo.findById(reservationId, tx);

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.ACTIVE) {
          throw new Error(`Cannot cancel reservation that is ${reservation.status.toLowerCase()}`);
        }

        // Get current product stock
        const product = await productRepo.findByIdWithLock(reservation.productId, tx);
        if (!product) {
          throw new Error('Product not found');
        }

        // Restore stock
        const updatedProduct = await productRepo.incrementStockWithTransaction(
          reservation.productId,
          reservation.quantity,
          tx
        );

        // Update reservation status
        await reservationRepo.updateStatus(reservationId, ReservationStatus.CANCELLED, tx);

        // Log cancellation
        await inventoryLogRepo.create(
          {
            productId: reservation.productId,
            changeType: ChangeType.RESERVATION_CANCEL,
            quantity: reservation.quantity,
            oldStock: product.availableStock,
            newStock: updatedProduct.availableStock,
            reason: `Reservation cancelled: ${reservation.id}`,
            metadata: { reservationId }
          },
          tx
        );

        metricsCollector.decrementActiveReservations();

        return { success: true, message: 'Reservation cancelled successfully' };
      });

      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.info(`Reservation cancelled: ${reservationId}`);
      
      return result;
    } catch (error) {
      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.error('Failed to cancel reservation', { error, reservationId });
      throw error;
    }
  }

  async expireReservations(): Promise<number> {
    const startTime = Date.now();
    const expiredReservations = await reservationRepo.findExpiredReservations();

    logger.info(`Found ${expiredReservations.length} expired reservations`);

    let expiredCount = 0;

    for (const reservation of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          const product = await productRepo.findByIdWithLock(reservation.productId, tx);
          if (!product) {
            throw new Error(`Product ${reservation.productId} not found`);
          }

          // Restore stock
          const updatedProduct = await productRepo.incrementStockWithTransaction(
            reservation.productId,
            reservation.quantity,
            tx
          );

          // Update reservation status
          await reservationRepo.updateStatus(reservation.id, ReservationStatus.EXPIRED, tx);

          await inventoryLogRepo.create(
            {
              productId: reservation.productId,
              changeType: ChangeType.RESERVATION_EXPIRE,
              quantity: reservation.quantity,
              oldStock: product.availableStock,
              newStock: updatedProduct.availableStock,
              reason: `Reservation expired: ${reservation.id}`,
              metadata: { reservationId: reservation.id }
            },
            tx
          );

          metricsCollector.decrementActiveReservations();
          expiredCount++;
        });
      } catch (error) {
        logger.error(`Failed to expire reservation ${reservation.id}`, { error });
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Expired ${expiredCount} reservations in ${duration}ms`);
    
    return expiredCount;
  }
}