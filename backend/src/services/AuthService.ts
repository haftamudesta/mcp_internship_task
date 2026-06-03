import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthResponse } from '../types';
import { logger } from '../utils/logger';

interface TokenPayload {
  id: string;
  email: string;
}

export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

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

    const payload: TokenPayload = { id: user.id, email: user.email };
    
  
    const token = (jwt as any).sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

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

    const payload: TokenPayload = { id: user.id, email: user.email };
    const token = (jwt as any).sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });

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

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = (jwt as any).verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.error('Token verification failed', { error });
      return null;
    }
  }
}