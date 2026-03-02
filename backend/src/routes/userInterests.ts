import express from 'express';
import {
  createUserInterest,
  getUserInterests,
  updateUserInterest,
  deleteUserInterest,
} from '../controllers/userInterestController';
import { authenticate } from '../middleware/auth';
import { validateUserInterest, validateInterestStatus } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/user-interests:
 *   post:
 *     summary: Show interest in a bus schedule
 *     tags: [User Interests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busScheduleId:
 *                 type: string
 *               pickupPointId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interest registered successfully
 */
router.post('/', authenticate, validateUserInterest, createUserInterest);

/**
 * @swagger
 * /api/user-interests:
 *   get:
 *     summary: Get current user's interests
 *     tags: [User Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user interests
 */
router.get('/', authenticate, getUserInterests);

/**
 * @swagger
 * /api/user-interests/{id}:
 *   put:
 *     summary: Update user interest status
 *     tags: [User Interests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [interested, confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Interest updated successfully
 */
router.put('/:id', validateInterestStatus, updateUserInterest);

router.delete('/:id', authenticate, deleteUserInterest);

export default router;