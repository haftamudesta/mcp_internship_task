import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { metricsCollector } from '../utils/metrics';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  metricsCollector.incrementTotalRequests();
  
  // Log request
  logger.debug(`${req.method} ${req.url} - Request received`, {
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[level](`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};