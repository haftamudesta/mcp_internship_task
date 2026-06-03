import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export class TokenController {
  generateTestToken(req: Request, res: Response): Response {
    const userId = req.body.userId || 'test-user-123';
    const email = req.body.email || 'test@example.com';
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    
    const token = jwt.sign(
      { id: userId, email: email },
      secret,
      { expiresIn: '1d' }
    );
    
    return res.json({
      success: true,
      token: token,
      message: 'Use this token in Authorization: Bearer <token> header'
    });
  }
}