import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Gracefully close database connections
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

// Handle application termination
process.on('beforeExit', async () => {
  await disconnectPrisma();
});

// For testing purposes
export const createPrismaClient = () => {
  return new PrismaClient();
};