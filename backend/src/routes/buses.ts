import express from 'express';
import {
  createBus,
  getAllBuses,
  getAllBusesForAdmin,
  getBusById,
  getDriverBus,
  updateBus,
  deleteBus,
  checkDriverBusAssignment,
  reassignBusToDriver,
} from '../controllers/busController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBus } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plateNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               driverId:
 *                 type: string
 *               routeId:
 *                 type: string
 *               fare:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bus created successfully
 */
router.post('/', authenticate, authorize('admin'), validateBus, createBus);

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
 *     responses:
 *       200:
 *         description: List of all buses
 */
router.get('/', getAllBuses);

/**
 * @swagger
 * /api/buses/admin/all:
 *   get:
 *     summary: Get all buses for admin (including offline)
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All buses retrieved successfully
 */
router.get('/admin/all', authenticate, authorize('admin'), getAllBusesForAdmin);

/**
 * @swagger
 * /api/buses/driver/my-bus:
 *   get:
 *     summary: Get driver's assigned bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver's bus details
 *       404:
 *         description: No bus assigned
 */
router.get('/driver/my-bus', authenticate, authorize('driver'), getDriverBus);

/**
 * @swagger
 * /api/buses/driver/check-assignment:
 *   get:
 *     summary: Check if driver has a bus assigned
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bus assignment found
 *       404:
 *         description: No bus assigned
 */
router.get('/driver/check-assignment', authenticate, authorize('driver'), checkDriverBusAssignment);


/**
 * @swagger
 * /api/buses/reassign:
 *   post:
 *     summary: Reassign a bus to a driver
 *     tags: [Buses]
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
 *               driverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bus reassigned successfully
 *       400:
 *         description: Invalid request or bus already assigned
 *       404:
 *         description: Bus or driver not found
 */
router.post('/reassign', authenticate, authorize('admin'), reassignBusToDriver);

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: Get bus by ID
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bus details
 *       404:
 *         description: Bus not found
 */
router.get('/:id', getBusById);

router.put('/:id', authenticate, authorize('admin'), updateBus);
router.delete('/:id', authenticate, authorize('admin'), deleteBus);

export default router;