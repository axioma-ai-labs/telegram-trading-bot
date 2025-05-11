import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma-generated/prisma/edge';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
    .$extends(withAccelerate())
    .$extends(fieldEncryptionExtension());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
