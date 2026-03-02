import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserStats,
  getDrivers,
  getRegularUsers,
  createUser,
  getWeeklyActivity,
  getRecentActivity,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateSignup } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, driver, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/drivers:
 *   get:
 *     summary: Get all drivers (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of drivers per page
 *     responses:
 *       200:
 *         description: List of drivers with pagination
 */
router.get('/drivers', authenticate, authorize('admin'), getDrivers);

/**
 * @swagger
 * /api/users/regular:
 *   get:
 *     summary: Get all regular users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of regular users with pagination
 */
router.get('/regular', authenticate, authorize('admin'), getRegularUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeUsers:
 *                       type: integer
 *                     activeDrivers:
 *                       type: integer
 *                     activeAdmins:
 *                       type: integer
 *                     inactiveUsers:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 */
router.get('/stats', authenticate, authorize('admin'), getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, authorize('admin'), getUserById);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user active status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Cannot deactivate own account
 *       404:
 *         description: User not found
 */
router.patch('/:id/status', authenticate, authorize('admin'), updateUserStatus);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, driver, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Cannot change own role
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, driver, admin]
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 */
router.post('/', authenticate, authorize('admin'), validateSignup, createUser);

/**
 * @swagger
 * /api/users/weekly-activity:
 *   get:
 *     summary: Get weekly activity data (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly activity data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weeklyData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       users:
 *                         type: integer
 *                       schedules:
 *                         type: integer
 *                       interests:
 *                         type: integer
 *                       trips:
 *                         type: integer
 */
router.get('/weekly-activity', authenticate, authorize('admin'), getWeeklyActivity);

/**
 * @swagger
 * /api/users/recent-activity:
 *   get:
 *     summary: Get recent activity data (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activity data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       action:
 *                         type: string
 *                       text:
 *                         type: string
 *                       time:
 *                         type: string
 *                       icon:
 *                         type: string
 */
router.get('/recent-activity', authenticate, authorize('admin'), getRecentActivity);

export default router;