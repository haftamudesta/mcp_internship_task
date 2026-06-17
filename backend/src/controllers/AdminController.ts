import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AdminController {
  async getAllReservations(req: AuthRequest, res: Response): Promise<Response> {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or Owner privileges required.'
      });
    }

    try {
      const reservations = await prisma.reservation.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              availableStock: true,
              totalStock: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reservations'
      });
    }
  }

  async getReservationStats(req: AuthRequest, res: Response): Promise<Response> {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or Owner privileges required.'
      });
    }

    try {
      const [total, active, expired, cancelled, completed] = await Promise.all([
        prisma.reservation.count(),
        prisma.reservation.count({ where: { status: 'ACTIVE' } }),
        prisma.reservation.count({ where: { status: 'EXPIRED' } }),
        prisma.reservation.count({ where: { status: 'CANCELLED' } }),
        prisma.reservation.count({ where: { status: 'COMPLETED' } }),
      ]);

      return res.json({
        success: true,
        data: {
          total,
          active,
          expired,
          cancelled,
          completed
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reservation stats'
      });
    }
  }

  async cancelReservation(req: AuthRequest, res: Response): Promise<Response> {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin or Owner privileges required.'
      });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reservation ID'
      });
    }

    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { 
          product: true 
        }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found'
        });
      }

      if (reservation.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: 'Only active reservations can be cancelled'
        });
      }

      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await prisma.product.update({
        where: { id: reservation.productId },
        data: {
          availableStock: {
            increment: reservation.quantity
          }
        }
      });

      await prisma.inventoryLog.create({
        data: {
          productId: reservation.productId,
          changeType: 'RESERVATION_CANCEL',
          quantity: reservation.quantity,
          oldStock: reservation.product.availableStock,
          newStock: reservation.product.availableStock + reservation.quantity,
          reason: `Admin cancelled reservation ${id}`
        }
      });

      return res.json({
        success: true,
        data: updatedReservation,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel reservation'
      });
    }
  }

  async getDailyAnalytics(req: AuthRequest, res: Response): Promise<Response> {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER')) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin or Owner privileges required.'
    });
  }
   const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  try {
    const dailyData = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as reservations,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as revenue
      FROM "Reservation"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;
    return res.json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch daily analytics'
    });
  }
}
}