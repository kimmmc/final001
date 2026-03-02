import express from 'express';
import {
  updateBusLocation,
  getBusLocation,
  getAllBusLocations,
  getBusLocationHistory,
  getNearbyBuses,
  setDriverOnlineStatus,
} from '../controllers/busLocationController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBusLocation, validateDriverStatus } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/bus-locations/update:
 *   post:
 *     summary: Update bus location (Driver only)
 *     tags: [Bus Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               speed:
 *                 type: number
 *                 default: 0
 *               heading:
 *                 type: number
 *                 default: 0
 *               accuracy:
 *                 type: number
 *                 default: 0
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Bus not found or not assigned to driver
 */
router.post('/update', authenticate, authorize('driver'), validateBusLocation, updateBusLocation);

/**
 * @swagger
 * /api/bus-locations/{busId}:
 *   get:
 *     summary: Get current location of a specific bus
 *     tags: [Bus Locations]
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     responses:
 *       200:
 *         description: Bus location details
 *       404:
 *         description: Bus not found
 */
router.get('/:busId', getBusLocation);

/**
 * @swagger
 * /api/bus-locations:
 *   get:
 *     summary: Get all bus locations
 *     tags: [Bus Locations]
 *     parameters:
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *       - in: query
 *         name: isOnline
 *         schema:
 *           type: boolean
 *         description: Filter by online status
 *     responses:
 *       200:
 *         description: List of all bus locations
 */
router.get('/', getAllBusLocations);

/**
 * @swagger
 * /api/bus-locations/{busId}/history:
 *   get:
 *     summary: Get bus location history
 *     tags: [Bus Locations]
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *           default: 1
 *         description: Number of hours of history to retrieve
 *     responses:
 *       200:
 *         description: Bus location history
 */
router.get('/:busId/history', getBusLocationHistory);

/**
 * @swagger
 * /api/bus-locations/nearby:
 *   get:
 *     summary: Get nearby buses within specified radius
 *     tags: [Bus Locations]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User's latitude
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User's longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby buses with distances
 */
router.get('/nearby/search', getNearbyBuses);

/**
 * @swagger
 * /api/bus-locations/driver/status:
 *   post:
 *     summary: Set driver online/offline status (Driver only)
 *     tags: [Bus Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId:
 *                 type: string
 *               isOnline:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Driver status updated successfully
 */
router.post('/driver/status', authenticate, authorize('driver'), validateDriverStatus, setDriverOnlineStatus);

export default router;