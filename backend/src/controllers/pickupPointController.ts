import { Request, Response } from 'express';
import PickupPoint from '../models/PickupPoint';
import Route from '../models/Route';

export const createPickupPoint = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, latitude, longitude, routeId, order } = req.body;

    // Verify route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({ error: 'Invalid route' });
    }

    const pickupPoint = new PickupPoint({
      name,
      description,
      latitude,
      longitude,
      routeId,
      order,
    });

    await pickupPoint.save();

    // Add pickup point to route
    await Route.findByIdAndUpdate(
      routeId,
      { $push: { pickupPoints: pickupPoint._id } }
    );

    res.status(201).json({
      message: 'Pickup point created successfully',
      pickupPoint,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllPickupPoints = async (req: Request, res: Response): Promise<any> => {
  try {
    const { routeId } = req.query;
    
    let query: any = { isActive: true };
    if (routeId) {
      query.routeId = routeId;
    }

    const pickupPoints = await PickupPoint.find(query)
      .populate('routeId', 'name description')
      .sort({ order: 1 });

    res.json({ pickupPoints });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPickupPointById = async (req: Request, res: Response): Promise<any> => {
  try {
    const pickupPoint = await PickupPoint.findById(req.params.id)
      .populate('routeId', 'name description');

    if (!pickupPoint) {
      return res.status(404).json({ error: 'Pickup point not found' });
    }

    res.json({ pickupPoint });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePickupPoint = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, latitude, longitude, order } = req.body;

    const pickupPoint = await PickupPoint.findByIdAndUpdate(
      req.params.id,
      { name, description, latitude, longitude, order },
      { new: true }
    ).populate('routeId', 'name description');

    if (!pickupPoint) {
      return res.status(404).json({ error: 'Pickup point not found' });
    }

    res.json({
      message: 'Pickup point updated successfully',
      pickupPoint,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePickupPoint = async (req: Request, res: Response): Promise<any> => {
  try {
    const pickupPoint = await PickupPoint.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pickupPoint) {
      return res.status(404).json({ error: 'Pickup point not found' });
    }

    // Remove from route
    await Route.findByIdAndUpdate(
      pickupPoint.routeId,
      { $pull: { pickupPoints: pickupPoint._id } }
    );

    res.json({ message: 'Pickup point deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};