import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { RegisterSchema, LoginSchema, ApiResponse, AuthResponse } from '../types';

const authService = new AuthService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class AuthController {
  async register(req: Request, res: Response<ApiResponse<AuthResponse>>): Promise<Response> {
    console.log('=== Registration Request ===');
    console.log('Request body:', req.body);
    
    const validation = RegisterSchema.safeParse(req.body);
    console.log('Validation passed:', validation.success);
    
    if (!validation.success) {
      console.log('Validation errors:', validation.error.issues);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    try {
      const { email, password, name } = validation.data;
      console.log('Calling authService.register...');
      const result = await authService.register(email, password, name);
      console.log('Registration successful!');

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      if (errorMessage.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: errorMessage
      });
    }
  }

  async login(req: Request, res: Response<ApiResponse<AuthResponse>>): Promise<Response> {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    try {
      const { email, password } = validation.data;
      const result = await authService.login(email, password);

      return res.json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      if (errorMessage.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: errorMessage
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response<ApiResponse<any>>): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  }

  async updateProfile(req: AuthRequest, res: Response<ApiResponse<any>>): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { name } = req.body;
    const user = await authService.updateProfile(userId, name);

    return res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  }
}