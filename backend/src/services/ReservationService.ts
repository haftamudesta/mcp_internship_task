import { prisma } from '../lib/prisma';
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

const EXPIRATION_MINUTES = parseInt(process.env.RESERVATION_EXPIRATION_MINUTES || '5', 10);

const ReservationStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
} as const;

const ChangeType = {
  RESERVATION_CREATE: 'RESERVATION_CREATE',
  RESERVATION_EXPIRE: 'RESERVATION_EXPIRE',
  RESERVATION_COMPLETE: 'RESERVATION_COMPLETE',
  RESERVATION_CANCEL: 'RESERVATION_CANCEL',
  STOCK_RESTORE: 'STOCK_RESTORE',
  ORDER_CREATE: 'ORDER_CREATE'
} as const;

export class ReservationService {
  async createReservation(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CreateReservationResult> {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + EXPIRATION_MINUTES);
    
    const startTime = Date.now();

    logger.info(`Creating reservation with ${EXPIRATION_MINUTES} minute expiration`, {
      userId,
      productId,
      quantity,
      expiresAt: expirationTime.toISOString()
    });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId }
        });
        
        if (!product) {
          throw new Error('Product not found');
        }

        if (product.availableStock < quantity) {
          metricsCollector.incrementFailedReservations();
          throw new Error('Insufficient stock');
        }

        const existingReservation = await tx.reservation.findFirst({
          where: {
            userId,
            productId,
            status: ReservationStatus.ACTIVE,
            expiresAt: { gt: new Date() }
          }
        });

        if (existingReservation) {
          throw new Error('Active reservation already exists for this product');
        }

        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            availableStock: {
              decrement: quantity
            }
          }
        });

        if (updatedProduct.availableStock < 0) {
          throw new Error('Stock would become negative');
        }

        const reservation = await tx.reservation.create({
          data: {
            userId,
            productId,
            quantity,
            status: ReservationStatus.ACTIVE,
            expiresAt: expirationTime
          }
        });

        await tx.inventoryLog.create({
          data: {
            productId,
            changeType: ChangeType.RESERVATION_CREATE,
            quantity,
            oldStock: product.availableStock,
            newStock: updatedProduct.availableStock,
            reason: `Reservation created with ${EXPIRATION_MINUTES}min expiration: ${reservation.id}`,
            metadata: { 
              reservationId: reservation.id, 
              userId,
              expirationMinutes: EXPIRATION_MINUTES,
              expiresAt: expirationTime.toISOString()
            }
          }
        });

        metricsCollector.incrementActiveReservations();
        
        return reservation;
      });

      metricsCollector.addResponseTime(Date.now() - startTime);
      logger.info(`Reservation created successfully: ${result.id}`, { 
        userId, 
        productId, 
        quantity,
        expiresAt: result.expiresAt,
        expirationMinutes: EXPIRATION_MINUTES
      });

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
        const reservation = await tx.reservation.findUnique({
          where: { id: reservationId },
          include: { product: true }
        });

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.ACTIVE) {
          throw new Error(`Reservation is ${reservation.status.toLowerCase()}`);
        }

        if (reservation.expiresAt < new Date()) {
          throw new Error('Reservation has expired');
        }

        const product = await tx.product.findUnique({
          where: { id: reservation.productId }
        });

        if (!product) {
          throw new Error('Product not found');
        }

        const order = await tx.order.create({
          data: {
            userId: reservation.userId,
            productId: reservation.productId,
            reservationId: reservation.id,
            quantity: reservation.quantity,
            totalAmount: Number(product.price) * reservation.quantity,
            status: 'COMPLETED'
          }
        });

        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: ReservationStatus.COMPLETED }
        });

        await tx.inventoryLog.create({
          data: {
            productId: reservation.productId,
            changeType: ChangeType.RESERVATION_COMPLETE,
            quantity: reservation.quantity,
            oldStock: product.availableStock,
            newStock: product.availableStock,
            reason: `Reservation completed: ${reservation.id}`,
            metadata: { reservationId, orderId: order.id }
          }
        });

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

  async expireReservations(): Promise<number> {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: new Date() }
      },
      include: { product: true }
    });

    logger.info(`Found ${expiredReservations.length} expired reservations`);

    let expiredCount = 0;

    for (const reservation of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: reservation.productId }
          });

          if (!product) {
            throw new Error(`Product ${reservation.productId} not found`);
          }

          const updatedProduct = await tx.product.update({
            where: { id: reservation.productId },
            data: {
              availableStock: {
                increment: reservation.quantity
              }
            }
          });

          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.EXPIRED }
          });

          await tx.inventoryLog.create({
            data: {
              productId: reservation.productId,
              changeType: ChangeType.RESERVATION_EXPIRE,
              quantity: reservation.quantity,
              oldStock: product.availableStock,
              newStock: updatedProduct.availableStock,
              reason: `Reservation expired after ${EXPIRATION_MINUTES} minutes: ${reservation.id}`,
              metadata: { 
                reservationId: reservation.id,
                expirationMinutes: EXPIRATION_MINUTES
              }
            }
          });

          metricsCollector.decrementActiveReservations();
          expiredCount++;
        });
      } catch (error) {
        logger.error(`Failed to expire reservation ${reservation.id}`, { error });
      }
    }

    return expiredCount;
  }

  async getUserActiveReservations(userId: string): Promise<any[]> {
    return prisma.reservation.findMany({
      where: {
        userId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() }
      },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new Error(`Cannot cancel reservation that is ${reservation.status.toLowerCase()}`);
      }

      const product = await tx.product.findUnique({
        where: { id: reservation.productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const updatedProduct = await tx.product.update({
        where: { id: reservation.productId },
        data: {
          availableStock: {
            increment: reservation.quantity
          }
        }
      });

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED }
      });

      await tx.inventoryLog.create({
        data: {
          productId: reservation.productId,
          changeType: ChangeType.RESERVATION_CANCEL,
          quantity: reservation.quantity,
          oldStock: product.availableStock,
          newStock: updatedProduct.availableStock,
          reason: `Reservation cancelled by user: ${reservation.id}`,
          metadata: { reservationId }
        }
      });

      metricsCollector.decrementActiveReservations();

      return { success: true, message: 'Reservation cancelled successfully' };
    });
  }
}