import { Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { Product } from '../types';

export class ProductRepository extends BaseRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<Product[]> {
    const { skip, take, where, orderBy } = params;
    const results = await this.prisma.product.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: {
          select: { reservations: true }
        }
      }
    });
    
    return results.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      _count: product._count
    }));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true }
        }
      }
    });
    
    if (!product) return null;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      _count: product._count
    };
  }

  async findByIdWithLock(id: string, tx: Prisma.TransactionClient): Promise<Product | null> {
    const product = await tx.product.findUnique({
      where: { id }
    });
    
    if (!product) return null;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  async findAvailableStock(id: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { availableStock: true }
    });
    return product?.availableStock ?? 0;
  }

  async decrementStockWithTransaction(
    id: string, 
    quantity: number, 
    tx: Prisma.TransactionClient
  ): Promise<Product> {
    const product = await tx.product.update({
      where: { id },
      data: {
        availableStock: {
          decrement: quantity
        }
      }
    });
    
    if (product.availableStock < 0) {
      throw new Error('Insufficient stock');
    }
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  async incrementStockWithTransaction(
    id: string, 
    quantity: number, 
    tx: Prisma.TransactionClient
  ): Promise<Product> {
    const product = await tx.product.update({
      where: { id },
      data: {
        availableStock: {
          increment: quantity
        }
      }
    });
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  async getTotalCount(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.prisma.product.count({ where });
  }
}