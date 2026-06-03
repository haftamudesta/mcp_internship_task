import { Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { InventoryLog } from '../types';

type ChangeType = 'RESERVATION_CREATE' | 'RESERVATION_EXPIRE' | 'RESERVATION_COMPLETE' | 'RESERVATION_CANCEL' | 'STOCK_RESTORE' | 'ORDER_CREATE';

export class InventoryLogRepository extends BaseRepository {
  async create(data: {
    productId: string;
    changeType: InventoryLog['changeType'];
    quantity: number;
    oldStock: number;
    newStock: number;
    reason: string;
    metadata?: Record<string, unknown>;
  }, tx?: Prisma.TransactionClient): Promise<InventoryLog> {
    const client = this.getTransactionClient(tx);
    
    const metadataValue = data.metadata 
      ? JSON.parse(JSON.stringify(data.metadata))
      : null;
    
    const result = await client.inventoryLog.create({
      data: {
        productId: data.productId,
        changeType: data.changeType as string,
        quantity: data.quantity,
        oldStock: data.oldStock,
        newStock: data.newStock,
        reason: data.reason,
        metadata: metadataValue
      }
    });
    
    const parsedMetadata = result.metadata && typeof result.metadata === 'object'
      ? result.metadata as Record<string, unknown>
      : null;
    
    return {
      id: result.id,
      productId: result.productId,
      changeType: result.changeType as InventoryLog['changeType'],
      quantity: result.quantity,
      oldStock: result.oldStock,
      newStock: result.newStock,
      reason: result.reason,
      metadata: parsedMetadata,
      createdAt: result.createdAt
    };
  }

  async findByProduct(productId: string, limit = 100): Promise<InventoryLog[]> {
    const results = await this.prisma.inventoryLog.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return results.map(result => ({
      id: result.id,
      productId: result.productId,
      changeType: result.changeType as InventoryLog['changeType'],
      quantity: result.quantity,
      oldStock: result.oldStock,
      newStock: result.newStock,
      reason: result.reason,
      metadata: result.metadata && typeof result.metadata === 'object'
        ? result.metadata as Record<string, unknown>
        : null,
      createdAt: result.createdAt
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<InventoryLog[]> {
    const results = await this.prisma.inventoryLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return results.map(result => ({
      id: result.id,
      productId: result.productId,
      changeType: result.changeType as InventoryLog['changeType'],
      quantity: result.quantity,
      oldStock: result.oldStock,
      newStock: result.newStock,
      reason: result.reason,
      metadata: result.metadata && typeof result.metadata === 'object'
        ? result.metadata as Record<string, unknown>
        : null,
      createdAt: result.createdAt
    }));
  }

  async getStockHistory(productId: string): Promise<InventoryLog[]> {
    const results = await this.prisma.inventoryLog.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });
    
    return results.map(result => ({
      id: result.id,
      productId: result.productId,
      changeType: result.changeType as InventoryLog['changeType'],
      quantity: result.quantity,
      oldStock: result.oldStock,
      newStock: result.newStock,
      reason: result.reason,
      metadata: result.metadata && typeof result.metadata === 'object'
        ? result.metadata as Record<string, unknown>
        : null,
      createdAt: result.createdAt
    }));
  }
}