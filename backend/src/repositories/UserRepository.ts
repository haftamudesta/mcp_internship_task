import { BaseRepository } from './BaseRepository';
import { User } from '../types';

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async create(data: { email: string; password: string; name?: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name || null
      }
    });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}