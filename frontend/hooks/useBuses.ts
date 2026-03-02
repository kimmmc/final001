import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Bus } from '@/types/bus';

interface ApiBus {
  id: string;
  plateNumber: string;
  driver: any;
  route: any;
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    lastUpdated: Date | null;
    speed: number;
    heading: number;
  };
  distance?: number;
  isOnline: boolean;
  // Direction information
  currentDirection?: 'outbound' | 'inbound';
  routeOrigin?: string;
  routeDestination?: string;
  directionDisplay?: string;
}

interface BackendBus {
  _id: string;
  plateNumber: string;
  capacity: number;
  driverId: any;
  routeId: any;
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    lastUpdated: Date | null;
    speed: number;
    heading: number;
  };
  isActive: boolean;
  isOnline: boolean;
}

export function useBuses(userLocation?: { latitude: number; longitude: number }, showNearbyOnly: boolean = false) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const transformBackendBusToFrontendBus = (backendBus: BackendBus, distance?: number): Bus => {
    // Use actual route data from your database
    const routeName = backendBus.routeId?.name || `Route ${backendBus.plateNumber}`;
    const routeDescription = backendBus.routeId?.description || 'Route Description';
    
    // Use actual driver data from your database
    const driverName = backendBus.driverId?.name || 'Driver';
    
    // Calculate ETA based on distance and estimated duration
    let eta = Math.floor(Math.random() * 20) + 5; // Default fallback
    if (distance && backendBus.routeId?.estimatedDuration) {
      // Use route's estimated duration and distance to calculate ETA
      eta = Math.max(Math.floor(distance * 3), 2); // Minimum 2 minutes
    }

    return {
      id: backendBus._id,
      plateNumber: backendBus.plateNumber, // Use actual plate number from database
      route: routeName,
      destination: routeDescription,
      currentLocation: {
        latitude: backendBus.currentLocation.latitude || -1.9441,
        longitude: backendBus.currentLocation.longitude || 30.0619,
      },
      nextStop: 'Next Stop', // You can enhance this with actual pickup point data
      eta,
      capacity: backendBus.capacity, // Use actual capacity from database
      currentPassengers: Math.floor(Math.random() * (backendBus.capacity || 25)),
      isActive: backendBus.isActive && backendBus.isOnline,
      isOnline: backendBus.isOnline, // Include online status
      interested: Math.floor(Math.random() * 10),
      fare: backendBus.routeId?.fare || 400, // Get fare from route only
      schedule: '05:00–23:00', // You can enhance this with actual schedule data
      distance: distance,
      // Note: Direction is now schedule-specific, not bus-specific
      routeOrigin: (backendBus as any).routeOrigin,
      routeDestination: (backendBus as any).routeDestination,
    };
  };

  const transformApiBusToFrontendBus = (apiBus: ApiBus): Bus => {
    return {
      id: apiBus.id,
      plateNumber: apiBus.plateNumber, // Use actual plate number from API
      route: apiBus.route?.name || `Route ${apiBus.plateNumber}`,
      destination: apiBus.route?.description || 'Unknown Destination',
      currentLocation: {
        latitude: apiBus.currentLocation.latitude || -1.9441,
        longitude: apiBus.currentLocation.longitude || 30.0619,
      },
      nextStop: 'Next Stop',
      eta: apiBus.distance ? Math.max(Math.floor(apiBus.distance * 3), 2) : Math.floor(Math.random() * 20) + 5,
      capacity: 30,
      currentPassengers: Math.floor(Math.random() * 25),
      isActive: apiBus.isOnline,
      isOnline: apiBus.isOnline, // Include online status
      interested: Math.floor(Math.random() * 10),
      fare: apiBus.route?.fare || 400, // Get fare from route
      schedule: '05:00–23:00',
      distance: apiBus.distance,
      // Direction information
      currentDirection: apiBus.currentDirection,
      routeOrigin: apiBus.routeOrigin,
      routeDestination: apiBus.routeDestination,
      directionDisplay: apiBus.directionDisplay,
      // Note: Nearby buses from getNearbyBuses don't have scheduleId/pickupPointId
      // These will be undefined, which means interest functionality won't work for nearby buses
    };
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching buses from your database...');

      if (userLocation && showNearbyOnly) {
        // For nearby buses only (home page) - only online buses within 6km
        try {
          const response = await apiService.getNearbyBuses(
            userLocation.latitude,
            userLocation.longitude,
            6 // km radius for nearby
          );
          console.log('Found nearby online buses:', response.buses.length);
          
          // Get schedules to add schedule information to nearby buses
          const schedulesResponse = await apiService.getBusSchedules();
          const schedules = schedulesResponse.schedules;
          
          const transformedBuses = response.buses.map(apiBus => {
            // Find the next/active schedule for this bus
            const busSchedules = schedules.filter(s => {
              if (typeof s.busId === 'string') return s.busId === apiBus.id;
              if (s.busId && s.busId._id) return s.busId._id === apiBus.id;
              return false;
            });
            const schedule = busSchedules[0];
            let scheduleId: string | undefined = undefined;
            let pickupPointId: string | undefined = undefined;
            if (schedule) {
              scheduleId = schedule._id;
              if (schedule.estimatedArrivalTimes && schedule.estimatedArrivalTimes.length > 0) {
                const pickup = schedule.estimatedArrivalTimes[0];
                if (pickup && pickup.pickupPointId) {
                  pickupPointId = typeof pickup.pickupPointId === 'string' ? pickup.pickupPointId : pickup.pickupPointId._id;
                }
              }
            }
            
            return {
              ...transformApiBusToFrontendBus(apiBus),
              scheduleId,
              pickupPointId,
            };
          });
          
          setBuses(transformedBuses);
          return;
        } catch (nearbyError) {
          console.log('Nearby buses API failed, trying all buses:', nearbyError);
        }
      }

      // Fetch all buses from your database - show all buses for main list
      const response = await apiService.getBuses(); // This now returns all active buses
      const schedulesResponse = await apiService.getBusSchedules();
      const schedules = schedulesResponse.schedules;

      let transformedBuses = response.buses
        .filter(bus => bus.isActive) // Show all active buses
        .map(bus => {
          // Find the next/active schedule for this bus
          const busSchedules = schedules.filter(s => {
            if (typeof s.busId === 'string') return s.busId === bus._id;
            if (s.busId && s.busId._id) return s.busId._id === bus._id;
            return false;
          });
          const schedule = busSchedules[0];
          let scheduleId: string | undefined = undefined;
          let pickupPointId: string | undefined = undefined;
          if (schedule) {
            scheduleId = schedule._id;
            if (schedule.estimatedArrivalTimes && schedule.estimatedArrivalTimes.length > 0) {
              const pickup = schedule.estimatedArrivalTimes[0];
              if (pickup && pickup.pickupPointId) {
                pickupPointId = typeof pickup.pickupPointId === 'string' ? pickup.pickupPointId : pickup.pickupPointId._id;
              }
            }
          }
          let distance: number | undefined;
          if (userLocation && bus.currentLocation.latitude && bus.currentLocation.longitude) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              bus.currentLocation.latitude,
              bus.currentLocation.longitude
            );
          }
          // Remove the fare handling from bus mapping since buses don't have fare anymore
          const backendBusData = bus as BackendBus;
          return {
            ...transformBackendBusToFrontendBus(backendBusData, distance),
            scheduleId,
            pickupPointId,
          };
        });

      // For home page, show nearby buses (within 10km) but be more lenient
      if (showNearbyOnly && userLocation) {
        transformedBuses = transformedBuses
          .filter(bus => !bus.distance || bus.distance <= 10) // Within 10km for home
          .sort((a, b) => (a.distance || 999) - (b.distance || 999))
          .slice(0, 8); // Limit to 8 buses for home page
      } else {
        // For buses page, show all buses but sort by distance if location available
        if (userLocation) {
          transformedBuses = transformedBuses
            .sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }
      }

      console.log(`Transformed ${transformedBuses.length} buses`);
      setBuses(transformedBuses);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    
    // Set up polling to refresh bus data every 30 seconds
    const interval = setInterval(fetchBuses, 30000);
    
    return () => clearInterval(interval);
  }, [userLocation, showNearbyOnly]);

  const refetch = () => {
    fetchBuses();
  };

  return { buses, loading, error, refetch };
}