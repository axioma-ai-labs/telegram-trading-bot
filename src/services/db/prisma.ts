import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client/edge';
import { fieldEncryptionExtension } from 'prisma-field-encryption';
import { config } from '@/config/config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.environment === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
    .$extends(withAccelerate())
    .$extends(fieldEncryptionExtension());

if (config.environment !== 'production') globalForPrisma.prisma = prisma;
