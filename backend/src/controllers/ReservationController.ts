import { Request, Response } from 'express';
import { ReservationService } from '../services/ReservationService';
import { CreateReservationSchema, CheckoutSchema, ApiResponse } from '../types';

const reservationService = new ReservationService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role:string;
  };
}

export class ReservationController {
  async createReservation(req: AuthRequest, res: Response<ApiResponse<any>>): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const validation = CreateReservationSchema.safeParse(req.body);
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
      const { productId, quantity } = validation.data;
      const reservation = await reservationService.createReservation(userId, productId, quantity);

      return res.status(201).json({
        success: true,
        data: {
          reservationId: reservation.id,
          expiresAt: reservation.expiresAt,
          quantity: reservation.quantity
        },
        message: 'Reservation created successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Reservation failed';
      
      if (errorMessage.includes('Insufficient stock')) {
        return res.status(409).json({
          success: false,
          error: 'Insufficient stock',
          message: errorMessage
        });
      }
      
      if (errorMessage.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate reservation',
          message: errorMessage
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Reservation failed',
        message: errorMessage
      });
    }
  }

  async checkout(req: AuthRequest, res: Response<ApiResponse<any>>): Promise<Response> {
    const validation = CheckoutSchema.safeParse(req.body);
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
      const { reservationId } = validation.data;
      const order = await reservationService.checkoutReservation(reservationId);

      return res.json({
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          totalAmount: order.totalAmount
        },
        message: 'Checkout completed successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      
      if (errorMessage.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found',
          message: errorMessage
        });
      }
      
      if (errorMessage.includes('expired')) {
        return res.status(410).json({
          success: false,
          error: 'Reservation expired',
          message: errorMessage
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Checkout failed',
        message: errorMessage
      });
    }
  }

  async getUserReservations(req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const reservations = await reservationService.getUserActiveReservations(userId);
    
    return res.json({ 
      success: true, 
      data: reservations 
    });
  }

  async cancelReservation(req: AuthRequest, res: Response<ApiResponse<any>>): Promise<Response> {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { id } = req.params;
    const reservationId = Array.isArray(id) ? id[0] : id;
    
    if (!reservationId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reservation ID',
        message: 'Reservation ID is required'
      });
    }
    
    try {
      const result = await reservationService.cancelReservation(reservationId);
      
      return res.json({
        success: true,
        data: result,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cancellation failed';
      
      if (errorMessage.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found',
          message: errorMessage
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Cancellation failed',
        message: errorMessage
      });
    }
  }
}