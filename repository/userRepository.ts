import { IUser } from '../types';
import { GenericRepository } from './genericRepository';
import { prisma } from '../config/db';

class UserRepository extends GenericRepository<IUser> {
  constructor() {
    super('user'); // Prisma model name (lowercase)
  }

  async getEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }

  async getWithPersonById(id: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: { person: true },
    }) as IUser | null;
  }

  async searchByEmailOrPersonName(searchTerm: string): Promise<IUser[]> {
    return await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { person: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      include: { person: true },
    }) as IUser[];
  }
}

export default new UserRepository();
