import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiErrorResponse } from '../types';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response<ApiErrorResponse>, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(issue => ({
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
      next(error);
    }
  };
};