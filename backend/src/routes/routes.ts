import express from 'express';
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} from '../controllers/routeController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRoute } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               estimatedDuration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Route created successfully
 */
router.post('/', authenticate, authorize('admin'), validateRoute, createRoute);

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Routes]
 *     responses:
 *       200:
 *         description: List of all routes
 */
router.get('/', getAllRoutes);

router.get('/:id', getRouteById);
router.put('/:id', authenticate, authorize('admin'), updateRoute);
router.delete('/:id', authenticate, authorize('admin'), deleteRoute);

export default router;