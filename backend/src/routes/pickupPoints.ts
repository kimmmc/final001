import express from 'express';
import {
  createPickupPoint,
  getAllPickupPoints,
  getPickupPointById,
  updatePickupPoint,
  deletePickupPoint,
} from '../controllers/pickupPointController';
import { authenticate, authorize } from '../middleware/auth';
import { validatePickupPoint } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/pickup-points:
 *   post:
 *     summary: Create a new pickup point
 *     tags: [Pickup Points]
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
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               routeId:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Pickup point created successfully
 */
router.post('/', authenticate, authorize('admin'), validatePickupPoint, createPickupPoint);

/**
 * @swagger
 * /api/pickup-points:
 *   get:
 *     summary: Get all pickup points
 *     tags: [Pickup Points]
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *     responses:
 *       200:
 *         description: List of pickup points
 */
router.get('/', getAllPickupPoints);

router.get('/:id', getPickupPointById);
router.put('/:id', authenticate, authorize('admin'), updatePickupPoint);
router.delete('/:id', authenticate, authorize('admin'), deletePickupPoint);

export default router;