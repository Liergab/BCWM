import { Router, Request, Response } from 'express';
import { dbHealthCheck } from '../config/db';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   example: 2024-01-01T12:00:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: connected
 *       503:
 *         description: Application is unhealthy
 */
router.get('/health', async (req: Request, res: Response) => {
  const isDbHealthy = await dbHealthCheck();

  const healthcheck = {
    status: isDbHealthy ? 'OK' : 'ERROR',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: isDbHealthy ? 'connected' : 'disconnected',
    },
    memory: {
      heapUsed: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
  };

  try {
    if (!isDbHealthy) {
      res.status(503).json(healthcheck);
      return;
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    res.status(503).json(healthcheck);
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns whether the application is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is ready
 *       503:
 *         description: Application is not ready
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const isDbHealthy = await dbHealthCheck();

    if (!isDbHealthy) {
      res.status(503).json({ ready: false, reason: 'Database not connected' });
      return;
    }

    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, reason: 'Health check failed' });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Returns whether the application is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export default router;
