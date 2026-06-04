import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthResponse } from '../types';
import { logger } from '../utils/logger';
import { generateToken, verifyToken, JWTPayload } from '../utils/jwt';

export class AuthService {
  private readonly SALT_ROUNDS = 10;

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    const token = generateToken({ id: user.id, email: user.email });

    logger.info(`New user registered: ${user.email}`, { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email });

    logger.info(`User logged in: ${user.email}`, { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async updateProfile(userId: string, name?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { name: name || null },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  verifyToken(token: string): JWTPayload | null {
    return verifyToken(token);
  }
}