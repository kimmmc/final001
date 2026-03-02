import { Request, Response } from 'express';
import UserInterest from '../models/UserInterest';
import BusSchedule from '../models/BusSchedule';
import PickupPoint from '../models/PickupPoint';
import Bus from '../models/Bus';
import User from '../models/User';
import socketService from '../services/socketService';

export const createUserInterest = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { busScheduleId, pickupPointId } = req.body;

    // For demo purposes, if the schedule doesn't exist, create a mock one
    let busSchedule = await BusSchedule.findById(busScheduleId);
    if (!busSchedule) {
      console.error('Bus schedule not found for ID:', busScheduleId);
      return res.status(400).json({ error: 'Bus schedule not found' });
    }

    // For demo purposes, if the pickup point doesn't exist, create a mock one
    let pickupPointDoc = await PickupPoint.findById(pickupPointId);
    if (!pickupPointDoc) {
      console.error('Pickup point not found for ID:', pickupPointId);
      return res.status(400).json({ error: 'Pickup point not found' });
    }

    // Check if user already has interest for this schedule
    const existingInterest = await UserInterest.findOne({
      userId,
      busScheduleId,
      status: { $in: ['interested', 'confirmed'] }
    });

    if (existingInterest) {
      return res.status(400).json({ error: 'Already interested in this bus schedule' });
    }

    const userInterest = new UserInterest({
      userId,
      busScheduleId,
      pickupPointId,
      status: 'interested',
    });

    await userInterest.save();

    const populatedInterest = await UserInterest.findById(userInterest._id)
      .populate('busScheduleId', 'departureTime status')
      .populate('pickupPointId', 'name description');

    // Get bus and user details for real-time notification
    const populatedBusSchedule = populatedInterest.busScheduleId as any;
    const bus = await Bus.findById(populatedBusSchedule.busId);
    const user = await User.findById(userId);
    const pickupPoint = pickupPointDoc;

    if (bus && user && pickupPoint) {
      // Emit real-time notification to driver
      socketService.emitUserInterestUpdate({
        busId: bus._id.toString(),
        userId: user._id.toString(),
        userName: user.name,
        pickupPointId: pickupPoint._id.toString(),
        pickupPointName: pickupPoint.name,
        action: 'added',
      });
    }

    res.status(201).json({
      message: 'Interest registered successfully',
      interest: populatedInterest,
    });
  } catch (error) {
    console.error('Error creating user interest:', error, req.body);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserInterests = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    const interests = await UserInterest.find({ 
      userId,
      status: { $in: ['interested', 'confirmed'] } // Only active interests
    })
      .populate({
        path: 'busScheduleId',
        populate: [
          { path: 'busId', select: 'plateNumber capacity fare' },
          { path: 'routeId', select: 'name description fare' }
        ]
      })
      .populate('pickupPointId', 'name description')
      .sort({ createdAt: -1 });

    res.json({ interests });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserInterest = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.body;

    const interest = await UserInterest.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status },
      { new: true }
    ).populate('busScheduleId', 'departureTime status')
     .populate('pickupPointId', 'name description');

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json({
      message: 'Interest updated successfully',
      interest,
    });
  } catch (error) {
    console.error('Error updating user interest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUserInterest = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;

    const interest = await UserInterest.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json({ message: 'Interest cancelled successfully' });
  } catch (error) {
    console.error('Error deleting user interest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};