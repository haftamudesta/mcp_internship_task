import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';

import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logging';
import { additionalSecurityHeaders } from './middlewares/security';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';
import { ExpirationJob } from './jobs/ExpirationJob';
import dotenv from 'dotenv';

dotenv.config();

class Server {
  private app: express.Application;
  private port: number;
  private expirationJob: ExpirationJob;
  private serverInstance: any;
  private isShuttingDown: boolean = false;
  private activeConnections: Set<any> = new Set();

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.expirationJob = new ExpirationJob();
    this.serverInstance = null;

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(additionalSecurityHeaders);
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Track active connections for graceful shutdown
    this.app.use((req, res, next) => {
      if (this.isShuttingDown) {
        res.status(503).json({ 
          success: false, 
          error: 'Server is shutting down, please try again later' 
        });
        return;
      }
      
      // Track connection
      const connection = { req, res };
      this.activeConnections.add(connection);
      
      res.on('finish', () => this.activeConnections.delete(connection));
      res.on('close', () => this.activeConnections.delete(connection));
      
      next();
    });
    
    this.app.use(requestLogger);
    
    // UPDATED: Skip rate limiting for health and ready endpoints
    const globalLimiter = rateLimit({
      windowMs: 45 * 60 * 1000,
      max: 200,
      message: {
        success: false,
        error: 'Too many requests',
        message: 'Please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for health check and readiness check
      skip: (req) => {
        return req.path === '/health';
      }
    });
    this.app.use(globalLimiter);
  }

  private initializeRoutes(): void {
    this.app.get('/health', async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
          database: 'connected',
          service: 'limited-drop-system',
          acceptingTraffic: !this.isShuttingDown
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: 'Database connection failed'
        });
      }
    });

    // Readiness check for Render (separate from health check)
    this.app.get('/ready', (_req, res) => {
      if (this.isShuttingDown) {
        res.status(503).json({ status: 'not ready', reason: 'shutting down' });
      } else {
        res.status(200).json({ status: 'ready' });
      }
    });

    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Limited Stock Product Drop System',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          ready: '/ready',
          metrics: '/metrics',
          auth: '/api/auth',
          products: '/api/products',
          reservations: '/api/reservations',
          token: '/api/token'
        },
        documentation: 'See README.md for API documentation'
      });
    });

    this.app.use(routes);
    
  }

  private initializeErrorHandling(): void {
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        message: 'The requested endpoint does not exist'
      });
    });

    this.app.use(errorHandler);
  }

  private async initializeJobs(): Promise<void> {
    this.expirationJob.start();
    logger.info('Background jobs initialized');
  }

  private async gracefulShutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    logger.info('Received shutdown signal, closing gracefully...');
    
    // Stop accepting new cron jobs
    this.expirationJob.stop();
    logger.info(' Cron job stopped');
    
    // Give ongoing requests time to complete
    const activeCount = this.activeConnections.size;
    if (activeCount > 0) {
      logger.info(`Waiting for ${activeCount} active connections to complete...`);
      
      const maxWaitTime = 25000;
      const startTime = Date.now();
      
      while (this.activeConnections.size > 0 && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.debug(`Still waiting for ${this.activeConnections.size} connections...`);
      }
      
      if (this.activeConnections.size > 0) {
        logger.warn(` Force closing with ${this.activeConnections.size} active connections`);
      }
    }
    
    if (this.serverInstance) {
      await new Promise((resolve) => {
        this.serverInstance.close(resolve);
      });
      logger.info('HTTP server closed');
    }
    
    await prisma.$disconnect();
    logger.info(' Database connection closed');
    
    logger.info(' Graceful shutdown completed');
    process.exit(0);
  }

  public async start(): Promise<void> {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      
      // Initialize background jobs
      await this.initializeJobs();
      
      // Start server
      this.serverInstance = this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Metrics available at http://localhost:${this.port}/metrics`);
        logger.info(`Health check at http://localhost:${this.port}/health`);
        logger.info(`Readiness check at http://localhost:${this.port}/ready`);
        logger.info(`Auth endpoints available at http://localhost:${this.port}/api/auth`);
        logger.info(`Product endpoints available at http://localhost:${this.port}/api/products`);
        logger.info(`Prisma Client Singleton initialized`);
      });
      
      // Handle graceful shutdown signals
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());
      
      return;
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start().catch((error) => {
  logger.error('Unhandled error during server start:', error);
  process.exit(1);
});

export default server;