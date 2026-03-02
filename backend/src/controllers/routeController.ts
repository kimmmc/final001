import { Request, Response } from 'express';
import Route from '../models/Route';
import PickupPoint from '../models/PickupPoint';

export const createRoute = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, estimatedDuration, fare } = req.body;

    const route = new Route({
      name,
      description,
      estimatedDuration,
      fare,
    });

    await route.save();

    res.status(201).json({
      message: 'Route created successfully',
      route,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllRoutes = async (req: Request, res: Response): Promise<any> => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('pickupPoints');

    res.json({ routes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRouteById = async (req: Request, res: Response): Promise<any> => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('pickupPoints');

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ route });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateRoute = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, estimatedDuration, fare } = req.body;

    const updateData: any = { name, description, estimatedDuration };
    if (fare !== undefined) {
      updateData.fare = fare;
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('pickupPoints');

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      message: 'Route updated successfully',
      route,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteRoute = async (req: Request, res: Response): Promise<any> => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Also deactivate associated pickup points
    await PickupPoint.updateMany(
      { routeId: req.params.id },
      { isActive: false }
    );

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};