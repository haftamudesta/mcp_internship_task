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
    
    // Parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    this.app.use(requestLogger);
    
    const globalLimiter = rateLimit({
      windowMs: 45 * 60 * 1000, // 15 minutes
      max: 200, // 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests',
        message: 'Please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(globalLimiter);
  }

  private initializeRoutes(): void {
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Limited Stock Product Drop System',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
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
    logger.info('Received shutdown signal, closing gracefully...');
    
    this.expirationJob.stop();
    
    if (this.serverInstance) {
      await new Promise((resolve) => {
        this.serverInstance.close(resolve);
      });
      logger.info('HTTP server closed');
    }
    
    await prisma.$disconnect();
    logger.info('Database connection closed');
    
    process.exit(0);
  }

  public async start(): Promise<void> {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      
      await this.initializeJobs();
      
      // Start server and store the instance
      this.serverInstance = this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📊 Metrics available at http://localhost:${this.port}/metrics`);
        logger.info(`❤️  Health check at http://localhost:${this.port}/health`);
        logger.info(`🔐 Auth endpoints available at http://localhost:${this.port}/api/auth`);
        logger.info(`📦 Product endpoints available at http://localhost:${this.port}/api/products`);
        logger.info(`💾 Prisma Client Singleton initialized`);
      });
      
      // Handle graceful shutdown
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