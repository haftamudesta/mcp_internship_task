import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Creating PrismaClient with adapter...');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to create PrismaClient with adapter:', error);
    console.log('Falling back to basic PrismaClient...');
    return new PrismaClient();
  }
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;