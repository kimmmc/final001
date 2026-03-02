import express from 'express';
import { predictTraffic } from '../controllers/predictionController';

const router = express.Router();

/**
 * @swagger
 * /api/predict-traffic:
 *   post:
 *     summary: Predict traffic congestion
 *     tags: [Predictions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Hour:
 *                 type: number
 *                 description: Hour of day (0-23)
 *               Day_of_Week:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               Road_Name:
 *                 type: string
 *                 enum: [KG 11 Ave, KK 15 Rd, KN 1 Rd, KN 3 Rd, RN1]
 *               Population_Density:
 *                 type: string
 *                 enum: [Medium, High]
 *               Rainfall:
 *                 type: string
 *                 enum: [No, Yes]
 *               Public_Holiday:
 *                 type: string
 *                 enum: [No, Yes]
 *     responses:
 *       200:
 *         description: Traffic prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prediction:
 *                   type: string
 *                   enum: [Low, Medium, High]
 *                 confidence:
 *                   type: number
 *                   description: Confidence percentage
 *                 description:
 *                   type: string
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                     road:
 *                       type: string
 *                     conditions:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/predict-traffic', predictTraffic);

export default router; 