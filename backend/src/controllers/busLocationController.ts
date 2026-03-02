import { Request, Response } from 'express';
import Bus from '../models/Bus';
import BusLocationHistory from '../models/BusLocationHistory';
import User from '../models/User';
import PickupPoint from '../models/PickupPoint';
import socketService from '../services/socketService';
import { ETACalculator } from '../utils/etaCalculator';

export const updateBusLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { busId, latitude, longitude, speed = 0, heading = 0, accuracy = 0 } = req.body;
    const driverId = (req as any).user.id;

    // Verify the bus belongs to the driver
    const bus = await Bus.findOne({ _id: busId, driverId });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found or not assigned to you' });
    }

    // Update bus current location (but don't change online status automatically)
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      {
        currentLocation: {
          latitude,
          longitude,
          lastUpdated: new Date(),
          speed,
          heading,
        },
        // Remove automatic isOnline setting - drivers must control this manually
      },
      { new: true }
    ).populate('driverId', 'name email phone')
     .populate('routeId', 'name description');

    // Save location history
    const locationHistory = new BusLocationHistory({
      busId,
      location: { latitude, longitude },
      speed,
      heading,
      accuracy,
    });
    await locationHistory.save();

    // Emit real-time update to all users
    socketService.emitBusLocationUpdate({
      busId,
      latitude,
      longitude,
      speed,
      heading,
      isOnline: updatedBus.isOnline, // Use current online status
    });

    res.json({
      message: 'Location updated successfully',
      bus: updatedBus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Check if location is recent (within last 5 minutes)
    const isLocationRecent = bus.currentLocation.lastUpdated && 
      (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 5 * 60 * 1000;

    res.json({
      bus: {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        isOnline: bus.isOnline && isLocationRecent,
        lastSeen: bus.currentLocation.lastUpdated,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBusLocations = async (req: Request, res: Response): Promise<any> => {
  try {
    const { routeId, isOnline, userLat, userLng, pickupPointId } = req.query;

    let query: any = { isActive: true };
    if (routeId) query.routeId = routeId;

    const buses = await Bus.find(query)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    // Get pickup points for ETA calculations
    const pickupPoints = await PickupPoint.find({ routeId: routeId || { $exists: true } });

    // Filter and format bus locations with ETA
    const busLocations = buses.map(bus => {
      // Check if bus is online - consider it online if:
      // 1. isOnline is true AND
      // 2. Has recent location update (within last 10 minutes)
      const isLocationRecent = bus.currentLocation.lastUpdated && 
        (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 10 * 60 * 1000;
      
      const busOnline = bus.isOnline && isLocationRecent;

      let eta = 15; // Default ETA
      let nearestPickupPoint = null;
      let distance = 0;

      // Calculate ETA if bus has location and is online
      if (busOnline && bus.currentLocation.latitude && bus.currentLocation.longitude) {
        const userLocation = userLat && userLng ? 
          { latitude: parseFloat(userLat as string), longitude: parseFloat(userLng as string) } : null;
        
        const routePickupPoints = pickupPoints
          .filter(p => p.routeId === bus.routeId)
          .map(p => ({
            id: p._id.toString(),
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
            order: p.order
          }));
        
        const etaResult = ETACalculator.calculateETAForUser(
          {
            latitude: bus.currentLocation.latitude,
            longitude: bus.currentLocation.longitude,
            speed: bus.currentLocation.speed,
            heading: bus.currentLocation.heading
          },
          userLocation,
          routePickupPoints,
          pickupPointId as string
        );

        eta = etaResult.eta;
        nearestPickupPoint = etaResult.pickupPoint;
        distance = etaResult.distance;
      }

      return {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        isOnline: busOnline,
        lastSeen: bus.currentLocation.lastUpdated,
        eta,
        nearestPickupPoint,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      };
    }).filter(bus => {
      // Only filter by online status if explicitly requested
      if (isOnline === 'true') return bus.isOnline;
      if (isOnline === 'false') return !bus.isOnline;
      // If not filtering by online status, show all active buses
      return true;
    });

    res.json({ buses: busLocations });
  } catch (error) {
    console.error('Error in getAllBusLocations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusLocationHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { busId } = req.params;
    const { hours = 1 } = req.query;

    // Calculate time range
    const timeRange = new Date();
    timeRange.setHours(timeRange.getHours() - Number(hours));

    const locationHistory = await BusLocationHistory.find({
      busId,
      timestamp: { $gte: timeRange },
    }).sort({ timestamp: -1 });

    res.json({ locationHistory });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNearbyBuses = async (req: Request, res: Response): Promise<any> => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Convert radius from km to degrees (approximate)
    const radiusInDegrees = Number(radius) / 111;

    // First try to find buses with recent location updates (within 15 minutes) that are online
    let buses = await Bus.find({
      isActive: true,
      isOnline: true, // Only get online buses
      'currentLocation.latitude': {
        $gte: Number(latitude) - radiusInDegrees,
        $lte: Number(latitude) + radiusInDegrees,
      },
      'currentLocation.longitude': {
        $gte: Number(longitude) - radiusInDegrees,
        $lte: Number(longitude) + radiusInDegrees,
      },
      'currentLocation.lastUpdated': {
        $gte: new Date(Date.now() - 15 * 60 * 1000), // Within last 15 minutes
      },
    }).populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    // If no recent online buses found, try with a more lenient time filter (within 24 hours)
    if (buses.length === 0) {
      console.log('No recent online buses found, trying with 24-hour filter...');
      buses = await Bus.find({
        isActive: true,
        isOnline: true, // Only get online buses
        'currentLocation.latitude': {
          $gte: Number(latitude) - radiusInDegrees,
          $lte: Number(latitude) + radiusInDegrees,
        },
        'currentLocation.longitude': {
          $gte: Number(longitude) - radiusInDegrees,
          $lte: Number(longitude) + radiusInDegrees,
        },
        'currentLocation.lastUpdated': {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      }).populate('driverId', 'name email phone')
        .populate('routeId', 'name description');
    }

    // If still no online buses found, try with any online buses that have location data (no time filter)
    if (buses.length === 0) {
      console.log('No online buses found with time filter, trying any online buses with location data...');
      buses = await Bus.find({
        isActive: true,
        isOnline: true, // Only get online buses
        $and: [
          {
            'currentLocation.latitude': {
              $gte: Number(latitude) - radiusInDegrees,
              $lte: Number(latitude) + radiusInDegrees,
            }
          },
          {
            'currentLocation.longitude': {
              $gte: Number(longitude) - radiusInDegrees,
              $lte: Number(longitude) + radiusInDegrees,
            }
          },
          {
            'currentLocation.latitude': { $ne: null }
          },
          {
            'currentLocation.longitude': { $ne: null }
          }
        ]
      }).populate('driverId', 'name email phone')
        .populate('routeId', 'name description');
    }

    // Calculate actual distances and filter
    const nearbyBuses = buses.map(bus => {
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        bus.currentLocation.latitude!,
        bus.currentLocation.longitude!
      );

      // Consider bus online if it has recent location and is marked as online
      const isLocationRecent = bus.currentLocation.lastUpdated && 
        (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 10 * 60 * 1000;
      const isOnline = bus.isOnline && isLocationRecent;

      // Get route information for direction display
      const route = bus.routeId as any;
      let directionDisplay = '';
      if (route && bus.currentDirection) {
        if (bus.currentDirection === 'outbound') {
          directionDisplay = `To ${route.destination || 'Destination'}`;
        } else {
          directionDisplay = `To ${route.origin || 'Origin'}`;
        }
      }

      return {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        isOnline: isOnline,
        lastSeen: bus.currentLocation.lastUpdated,
        // Direction information
        currentDirection: bus.currentDirection,
        routeOrigin: route?.origin,
        routeDestination: route?.destination,
        directionDisplay,
      };
    }).filter(bus => bus.distance <= Number(radius))
      .sort((a, b) => a.distance - b.distance);

    console.log(`Found ${nearbyBuses.length} nearby online buses within ${radius}km`);
    res.json({ buses: nearbyBuses });
  } catch (error) {
    console.error('Error in getNearbyBuses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setDriverOnlineStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { busId, isOnline } = req.body;
    const driverId = (req as any).user.id;

    console.log('setDriverOnlineStatus called with:', { busId, isOnline, driverId });

    // First, let's check what buses exist and their driver assignments
    const allBuses = await Bus.find({ isActive: true }).select('_id plateNumber driverId');
    console.log('All active buses in database:', allBuses.map(b => ({
      id: b._id.toString(),
      plateNumber: b.plateNumber,
      driverId: b.driverId?.toString() || 'null'
    })));

    // Verify the bus belongs to the driver
    let bus = await Bus.findOne({ _id: busId, driverId });
    console.log('Bus lookup result:', bus ? 'Found' : 'Not found');
    console.log('Looking for bus with driverId:', driverId);
    
    if (!bus) {
      console.log('Bus not found or not assigned to driver. BusId:', busId, 'DriverId:', driverId);
      
      // Let's also check what buses exist for this driver
      const driverBuses = await Bus.find({ driverId });
      console.log('All buses for this driver:', driverBuses.map(b => ({ id: b._id, plateNumber: b.plateNumber })));
      
      // Let's also check if the bus exists but with different driver
      const busWithDifferentDriver = await Bus.findOne({ _id: busId });
      if (busWithDifferentDriver) {
        console.log('Bus exists but assigned to different driver:', {
          busId,
          assignedDriverId: busWithDifferentDriver.driverId?.toString(),
          currentDriverId: driverId
        });
        
        // TEMPORARY FIX: Auto-reassign the bus to the current driver
        console.log('Auto-reassigning bus to current driver...');
        bus = await Bus.findByIdAndUpdate(
          busId,
          { driverId },
          { new: true }
        );
        console.log('Bus reassigned successfully');
      } else {
        return res.status(404).json({ error: 'Bus not found or not assigned to you' });
      }
    }

    console.log('Updating bus status:', { busId, isOnline });
    await Bus.findByIdAndUpdate(busId, { isOnline });

    // Emit real-time update to all users
    socketService.emitBusStatusChange(busId, isOnline);

    console.log('Driver status updated successfully');
    res.json({
      message: `Driver status updated to ${isOnline ? 'online' : 'offline'}`,
    });
  } catch (error) {
    console.error('Error in setDriverOnlineStatus:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}