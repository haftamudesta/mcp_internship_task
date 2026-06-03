import { OrderStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { Order } from '../types';

export class OrderRepository extends BaseRepository {
  async create(data: {
    userId: string;
    productId: string;
    reservationId: string;
    quantity: number;
    totalAmount: number;
    status: Order['status'];
  }, tx?: Prisma.TransactionClient): Promise<Order> {
    const client = this.getTransactionClient(tx);
    const result = await client.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        reservationId: data.reservationId,
        quantity: data.quantity,
        totalAmount: data.totalAmount,
        status: data.status
      },
      include: {
        product: true,
        user: true
      }
    });
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      reservationId: result.reservationId,
      quantity: result.quantity,
      totalAmount: Number(result.totalAmount),
      status: result.status as Order['status'],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: result.product ? {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      } : undefined,
      user: result.user ? {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || undefined,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt
      } : undefined
    };
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        user: true
      }
    });
    
    if (!result) return null;
    
    return {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      reservationId: result.reservationId,
      quantity: result.quantity,
      totalAmount: Number(result.totalAmount),
      status: result.status as Order['status'],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: result.product ? {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      } : undefined,
      user: result.user ? {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || undefined,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt
      } : undefined
    };
  }

  async findByUser(userId: string): Promise<Order[]> {
    const results = await this.prisma.order.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      reservationId: result.reservationId,
      quantity: result.quantity,
      totalAmount: Number(result.totalAmount),
      status: result.status as Order['status'],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      product: result.product ? {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      } : undefined
    }));
  }
}