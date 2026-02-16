import { prisma } from '../config/db';
import logger from '../config/logger';

// Prisma query parameters interface
export interface PrismaDbParams {
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

/**
 * Generic Repository for Prisma
 * Provides common CRUD operations for any Prisma model
 */
export class GenericRepository<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  /**
   * Get the Prisma delegate for this model
   */
  protected getDelegate(): any {
    return (prisma as any)[this.modelName];
  }

  /**
   * Find multiple documents
   */
  async docs(dbParams: PrismaDbParams = {}): Promise<T[]> {
    try {
      const delegate = this.getDelegate();

      const query: any = {};

      if (dbParams.where) query.where = dbParams.where;
      if (dbParams.select) query.select = dbParams.select;
      if (dbParams.include) query.include = dbParams.include;
      if (dbParams.orderBy) query.orderBy = dbParams.orderBy;
      if (dbParams.skip !== undefined) query.skip = dbParams.skip;
      if (dbParams.take !== undefined) query.take = dbParams.take;

      const result = await delegate.findMany(query);
      return result as T[];
    } catch (error) {
      logger.error(`Error in docs for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async add(data: Partial<T>): Promise<T> {
    try {
      const delegate = this.getDelegate();
      const result = await delegate.create({ data });
      return result as T;
    } catch (error) {
      logger.error(`Error in add for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document by ID
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const delegate = this.getDelegate();
      const result = await delegate.update({
        where: { id },
        data,
      });
      return result as T;
    } catch (error) {
      logger.error(`Error in update for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<T | null> {
    try {
      const delegate = this.getDelegate();
      const result = await delegate.delete({
        where: { id },
      });
      return result as T;
    } catch (error) {
      logger.error(`Error in delete for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Search documents by multiple fields
   */
  async search(searchTerm: string, fields: string[]): Promise<T[]> {
    try {
      const delegate = this.getDelegate();

      // Create OR condition for each field
      const orConditions = fields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive', // Case-insensitive search
        },
      }));

      const result = await delegate.findMany({
        where: {
          OR: orConditions,
        },
      });

      return result as T[];
    } catch (error) {
      logger.error(`Error in search for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find a single document by ID
   */
  async doc(id: string, dbParams: PrismaDbParams = {}): Promise<T | null> {
    try {
      const delegate = this.getDelegate();

      const query: any = {
        where: { id },
      };

      if (dbParams.select) query.select = dbParams.select;
      if (dbParams.include) query.include = dbParams.include;

      const result = await delegate.findUnique(query);
      return result as T | null;
    } catch (error) {
      logger.error(`Error in doc for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(where: any = {}): Promise<number> {
    try {
      const delegate = this.getDelegate();
      const result = await delegate.count({ where });
      return result;
    } catch (error) {
      logger.error(`Error in count for ${this.modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find a single document by condition
   */
  async findOne(where: any): Promise<T | null> {
    try {
      const delegate = this.getDelegate();
      const result = await delegate.findFirst({ where });
      return result as T | null;
    } catch (error) {
      logger.error(`Error in findOne for ${this.modelName}:`, error);
      throw error;
    }
  }
}
