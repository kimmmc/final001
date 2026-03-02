import { Request, Response } from 'express';
import Bus from '../models/Bus';
import User from '../models/User';
import Route from '../models/Route';

export const createBus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { plateNumber, capacity, driverId, routeId } = req.body;

    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ error: 'Invalid driver' });
    }

    // Verify route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({ error: 'Invalid route' });
    }

    const bus = new Bus({
      plateNumber,
      capacity,
      driverId,
      routeId,
    });

    await bus.save();
    
    const populatedBus = await Bus.findById(bus._id)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare');

    res.status(201).json({
      message: 'Bus created successfully',
      bus: populatedBus,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bus with this plate number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBuses = async (req: Request, res: Response): Promise<any> => {
  try {
    // Return all active buses for users (both online and offline)
    const buses = await Bus.find({ isActive: true })
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare origin destination isBidirectional');

    // Note: Direction is now schedule-specific, not bus-specific
    const busesWithInfo = buses.map(bus => {
      const busObj = bus.toObject();
      const route = busObj.routeId as any; // Type assertion for populated route

      return {
        ...busObj,
        routeOrigin: route?.origin,
        routeDestination: route?.destination,
      };
    });

    res.json({ buses: busesWithInfo });
  } catch (error) {
    console.error('Error in getAllBuses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBusesForAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Admin endpoint to get all buses including offline ones
    const buses = await Bus.find({ isActive: true })
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare origin destination isBidirectional');

    // Note: Direction is now schedule-specific, not bus-specific
    const busesWithInfo = buses.map(bus => {
      const busObj = bus.toObject();
      const route = busObj.routeId as any; // Type assertion for populated route

      return {
        ...busObj,
        routeOrigin: route?.origin,
        routeDestination: route?.destination,
      };
    });

    res.json({ buses: busesWithInfo });
  } catch (error) {
    console.error('Error in getAllBusesForAdmin:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusById = async (req: Request, res: Response): Promise<any> => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({ bus });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDriverBus = async (req: Request, res: Response): Promise<any> => {
  try {
    const driverId = (req as any).user.id;
    
    const bus = await Bus.findOne({ driverId, isActive: true })
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare estimatedDuration');

    if (!bus) {
      return res.status(404).json({ error: 'No bus assigned to you' });
    }

    res.json({ bus });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { plateNumber, capacity, driverId, routeId } = req.body;

    // Verify driver if provided
    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== 'driver') {
        return res.status(400).json({ error: 'Invalid driver' });
      }
    }

    // Verify route if provided
    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(400).json({ error: 'Invalid route' });
      }
    }

    const updateData: any = { plateNumber, capacity, driverId, routeId };

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('driverId', 'name email phone')
     .populate('routeId', 'name description fare');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({
      message: 'Bus updated successfully',
      bus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteBus = async (req: Request, res: Response): Promise<any> => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkDriverBusAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const driverId = (req as any).user.id;
    
    const bus = await Bus.findOne({ driverId, isActive: true })
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description fare estimatedDuration');

    if (!bus) {
      return res.status(404).json({ 
        error: 'No bus assigned to you',
        driverId,
        availableBuses: await Bus.find({ isActive: true }).select('_id plateNumber driverId')
      });
    }

    res.json({ 
      bus,
      message: 'Bus assignment found'
    });
  } catch (error) {
    console.error('Error checking driver bus assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reassignBusToDriver = async (req: Request, res: Response): Promise<any> => {
  try {
    const { busId, driverId } = req.body;

    // Verify the bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Verify the driver exists and is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ error: 'Invalid driver' });
    }

    // Reassign the bus to the driver
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      { driverId },
      { new: true }
    ).populate('driverId', 'name email phone')
     .populate('routeId', 'name description fare');

    res.json({
      message: 'Bus reassigned successfully',
      bus: updatedBus,
    });
  } catch (error) {
    console.error('Error reassigning bus:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

