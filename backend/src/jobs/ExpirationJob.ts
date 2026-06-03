import * as cron from 'node-cron';
import { ReservationService } from '../services/ReservationService';
import { logger } from '../utils/logger';

const reservationService = new ReservationService();

export class ExpirationJob {
  private cronExpression: string;
  private task: cron.ScheduledTask | null;

  constructor() {
    // Run every minute
    this.cronExpression = '* * * * *';
    this.task = null;
  }

  start(): void {
    if (this.task) {
      logger.warn('Expiration job is already running');
      return;
    }

    this.task = cron.schedule(this.cronExpression, async () => {
      const startTime = Date.now();
      logger.info('Running reservation expiration job');
      
      try {
        const expiredCount = await reservationService.expireReservations();
        const duration = Date.now() - startTime;
        
        if (expiredCount > 0) {
          logger.info(`Expired ${expiredCount} reservations and restored stock - took ${duration}ms`);
        } else {
          logger.debug(`Expiration job completed - no expired reservations found - took ${duration}ms`);
        }
      } catch (error) {
        logger.error('Error in expiration job:', error);
      }
    });

    logger.info('Reservation expiration job scheduled to run every minute');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Reservation expiration job stopped');
    }
  }

  isRunning(): boolean {
    return this.task !== null;
  }
}