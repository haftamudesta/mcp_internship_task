import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiErrorResponse } from '../types';

interface ErrorWithMessage {
  message: string;
  stack?: string;
  code?: string;
  meta?: unknown;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error;
}

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  return String(error);
}


export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction  // Prefix with underscore to indicate intentional non-use
): void => {
  const errorMessage = getErrorMessage(err);
  
  // Log error with full context
  logger.error({
    error: errorMessage,
    stack: isErrorWithMessage(err) ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }));
    
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors
    });
    return;
  }

  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({
          success: false,
          error: 'Duplicate entry error',
          details: `A record with this ${err.meta?.target} already exists`
        });
        return;
      case 'P2025': // Record not found
        res.status(404).json({
          success: false,
          error: 'Record not found',
          details: err.message
        });
        return;
      case 'P2014': // Invalid ID
        res.status(400).json({
          success: false,
          error: 'Invalid ID format',
          details: err.message
        });
        return;
      case 'P2003': // Foreign key constraint failed
        res.status(400).json({
          success: false,
          error: 'Related record not found',
          details: err.message
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: 'Database error',
          details: err.message
        });
        return;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      details: err.message
    });
    return;
  }

  // Handle business logic errors
  if (errorMessage.includes('Insufficient stock')) {
    res.status(409).json({
      success: false,
      error: 'Insufficient stock',
      message: errorMessage
    });
    return;
  }

  if (errorMessage.includes('not found')) {
    res.status(404).json({
      success: false,
      error: errorMessage
    });
    return;
  }

  if (errorMessage.includes('expired')) {
    res.status(410).json({
      success: false,
      error: errorMessage
    });
    return;
  }

  if (errorMessage.includes('already exists') || errorMessage.includes('already reserved')) {
    res.status(409).json({
      success: false,
      error: errorMessage
    });
    return;
  }

  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
    res.status(401).json({
      success: false,
      error: errorMessage
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : errorMessage
  });
};