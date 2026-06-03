import { Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { Reservation, Product } from '../types';

export interface ReservationWithProduct extends Reservation {
  product: Product;
}

type ReservationStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export class ReservationRepository extends BaseRepository {
  async create(data: {
    userId: string;
    productId: string;
    quantity: number;
    expiresAt: Date;
  }, tx?: Prisma.TransactionClient): Promise<Reservation> {
    const client = this.getTransactionClient(tx);
    const result = await client.reservation.create({
      data: {
        ...data,
        status: 'ACTIVE'
      }
    });
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<ReservationWithProduct | null> {
    const client = this.getTransactionClient(tx);
    const result = await client.reservation.findUnique({
      where: { id },
      include: { 
        product: true
      }
    });
    
    if (!result) return null;
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      }
    };
  }

  async findActiveByUserAndProduct(
    userId: string, 
    productId: string, 
    tx?: Prisma.TransactionClient
  ): Promise<Reservation | null> {
    const client = this.getTransactionClient(tx);
    const result = await client.reservation.findFirst({
      where: {
        userId,
        productId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      }
    });
    
    if (!result) return null;
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async findExpiredReservations(): Promise<ReservationWithProduct[]> {
    const results = await this.prisma.reservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() }
      },
      include: { 
        product: true
      }
    });
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      }
    }));
  }

  async updateStatus(
    id: string, 
    status: ReservationStatus, 
    tx?: Prisma.TransactionClient
  ): Promise<Reservation> {
    const client = this.getTransactionClient(tx);
    const result = await client.reservation.update({
      where: { id },
      data: { status }
    });
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }

  async findActiveByUser(userId: string): Promise<ReservationWithProduct[]> {
    const results = await this.prisma.reservation.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      quantity: result.quantity,
      status: result.status as Reservation['status'],
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      }
    }));
  }
}