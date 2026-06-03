import { prisma } from '../lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

export class BaseRepository {
  protected prisma: PrismaClient;
  
  constructor() {
    this.prisma = prisma; // Use singleton instance
  }
  
  protected getTransactionClient(tx?: Prisma.TransactionClient): Prisma.TransactionClient | PrismaClient {
    return tx || this.prisma;
  }
}