import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Prisma Client Singleton
class DatabaseService {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      // Prisma Client with binary engine (configured in schema.prisma)
      DatabaseService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }

    return DatabaseService.instance;
  }

  static async connect(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance();
      await prisma.$connect();
      logger.info('Prisma connected to MongoDB');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }
  }

  static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      DatabaseService.instance = null;
      logger.info('Prisma disconnected from MongoDB');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseService.getInstance();
      // Simple connection test for MongoDB
      await prisma.user.findFirst({ take: 1 });
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance getter
export const prisma = DatabaseService.getInstance();

// Export connection function for backward compatibility
const db = () => DatabaseService.connect();
export default db;

// Export disconnect for graceful shutdown
export const disconnectDB = DatabaseService.disconnect;

// Export health check
export const dbHealthCheck = DatabaseService.healthCheck;
