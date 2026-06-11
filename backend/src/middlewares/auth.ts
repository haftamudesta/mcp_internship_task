import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  role: string; 
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
    return;
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        error: 'Token has expired.' 
      });
      return;
    }
    
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token.' 
    });
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required.' 
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }
    
    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication required.' 
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin privileges required.' 
    });
    return;
  }
  
  next();
};

export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication required.' 
    });
    return;
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
    res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin or owner privileges required.' 
    });
    return;
  }
  
  next();
};

