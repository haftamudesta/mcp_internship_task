import { Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { Order, Product, User } from '../types';

type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface CreateOrderData {
  userId: string;
  productId: string;
  reservationId: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
}

export class OrderRepository extends BaseRepository {
  async create(data: CreateOrderData, tx?: Prisma.TransactionClient): Promise<Order> {
    const client = this.getTransactionClient(tx);
    const result = await client.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        reservationId: data.reservationId,
        quantity: data.quantity,
        totalAmount: data.totalAmount,
        status: data.status
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
      updatedAt: result.updatedAt
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
    
    const order: Order = {
      id: result.id,
      userId: result.userId,
      productId: result.productId,
      reservationId: result.reservationId,
      quantity: result.quantity,
      totalAmount: Number(result.totalAmount),
      status: result.status as Order['status'],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
    
    if (result.product) {
      order.product = {
        id: result.product.id,
        name: result.product.name,
        description: result.product.description,
        price: Number(result.product.price),
        totalStock: result.product.totalStock,
        availableStock: result.product.availableStock,
        createdAt: result.product.createdAt,
        updatedAt: result.product.updatedAt
      };
    }
    
    if (result.user) {
      order.user = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || undefined,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt
      };
    }
    
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    const results = await this.prisma.order.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return results.map(result => {
      const order: Order = {
        id: result.id,
        userId: result.userId,
        productId: result.productId,
        reservationId: result.reservationId,
        quantity: result.quantity,
        totalAmount: Number(result.totalAmount),
        status: result.status as Order['status'],
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
      
      if (result.product) {
        order.product = {
          id: result.product.id,
          name: result.product.name,
          description: result.product.description,
          price: Number(result.product.price),
          totalStock: result.product.totalStock,
          availableStock: result.product.availableStock,
          createdAt: result.product.createdAt,
          updatedAt: result.product.updatedAt
        };
      }
      
      return order;
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const result = await this.prisma.order.update({
      where: { id },
      data: { status }
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
      updatedAt: result.updatedAt
    };
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true }
    });
    return Number(result._sum.totalAmount ?? 0);
  }

  async getOrderCountByProduct(productId: string): Promise<number> {
    return this.prisma.order.count({
      where: { 
        productId,
        status: 'COMPLETED'
      }
    });
  }
}