import { Router } from 'express';
import { metricsCollector } from '../utils/metrics';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: metricsCollector.getMetrics(),
    timestamp: new Date().toISOString()
  });
});

export default router;