import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface DriverBus {
  id: string;
  plateNumber: string;
  capacity: number;
  fare: number;
  route: {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
  } | null;
  isOnline: boolean;
  isActive: boolean;
}

interface Schedule {
  id: string;
  departureTime: Date;
  status: string;
  direction?: 'outbound' | 'inbound';
  directionDisplay?: string;
  estimatedArrivalTimes: Array<{
    pickupPointId: string;
    estimatedTime: Date;
    actualTime?: Date;
  }>;
}

interface Passenger {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  pickupPoint: {
    id: string;
    name: string;
    description: string;
  } | null;
  status: string;
  createdAt: Date;
}

export function useDriverData() {
  const { user } = useAuth();
  const [bus, setBus] = useState<DriverBus | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [completedTripsCount, setCompletedTripsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverData = async () => {
    if (!user || user.role !== 'driver') {
      setError('Not authorized as driver');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all buses and find the one assigned to this driver
      const busesResponse = await apiService.getBuses();
      const driverBus = busesResponse.buses.find(b => 
        (b.driverId?._id === user.id) || 
        (b.driverId?.id === user.id) ||
        (b.driverId === user.id)
      );
      
      if (!driverBus) {
        setError('No bus assigned to you. Please contact your administrator.');
        setBus(null);
        setSchedules([]);
        setPassengers([]);
        setLoading(false);
        return;
      }

      // Transform bus data
      const transformedBus: DriverBus = {
        id: driverBus._id,
        plateNumber: driverBus.plateNumber,
        capacity: driverBus.capacity,
        fare: driverBus.fare,
        route: driverBus.routeId ? {
          id: driverBus.routeId._id || driverBus.routeId.id,
          name: driverBus.routeId.name || 'Unknown Route',
          description: driverBus.routeId.description || '',
          estimatedDuration: driverBus.routeId.estimatedDuration || 0,
        } : null,
        isOnline: driverBus.isOnline,
        isActive: driverBus.isActive,
      };

      setBus(transformedBus);

      // Get schedules for this bus (only incomplete ones: scheduled and in-transit)
      const schedulesResponse = await apiService.getBusSchedules();
      const busSchedules = schedulesResponse.schedules
        .filter(schedule => {
          const scheduleBusId = schedule.busId?._id || schedule.busId?.id || schedule.busId;
          const driverBusId = driverBus._id;
          const isIncomplete = schedule.status === 'scheduled' || schedule.status === 'in-transit';
          return scheduleBusId === driverBusId && isIncomplete;
        })
        .map(schedule => ({
          id: schedule._id,
          departureTime: new Date(schedule.departureTime),
          status: schedule.status,
          direction: (schedule as any).direction,
          directionDisplay: (schedule as any).directionDisplay,
          estimatedArrivalTimes: (schedule.estimatedArrivalTimes || []).map(arrival => ({
            pickupPointId: typeof arrival.pickupPointId === 'string' ? arrival.pickupPointId : (arrival.pickupPointId?._id || arrival.pickupPointId?.id || 'unknown'),
            estimatedTime: new Date(arrival.estimatedTime),
            actualTime: arrival.actualTime ? new Date(arrival.actualTime) : undefined,
          })),
        }));

      setSchedules(busSchedules);

      // Get interested passengers for all schedules
      const allPassengers: Passenger[] = [];
      for (const schedule of busSchedules) {
        try {
          const passengersResponse = await apiService.getInterestedPassengers(schedule.id);
          const schedulePassengers = (passengersResponse.interests || []).map(interest => ({
            id: interest._id,
            user: interest.userId ? {
              id: interest.userId._id || interest.userId.id || 'unknown',
              name: interest.userId.name || 'Unknown User',
              email: interest.userId.email || '',
              phone: interest.userId.phone || '',
            } : null,
            pickupPoint: interest.pickupPointId ? {
              id: interest.pickupPointId._id || interest.pickupPointId.id || 'unknown',
              name: interest.pickupPointId.name || 'Unknown Stop',
              description: interest.pickupPointId.description || '',
            } : null,
            status: interest.status,
            createdAt: new Date(interest.createdAt),
          }));
          allPassengers.push(...schedulePassengers);
        } catch (passengerError) {
          console.log('Error fetching passengers for schedule:', schedule.id, passengerError);
        }
      }

      setPassengers(allPassengers);

      // Get completed trips count for today
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const completedSchedulesResponse = await apiService.getBusSchedules(
          'completed',
          undefined,
          startOfDay.toISOString().split('T')[0]
        );
        
        const completedSchedules = completedSchedulesResponse.schedules.filter(schedule => {
          const scheduleBusId = schedule.busId?._id || schedule.busId?.id || schedule.busId;
          const driverBusId = driverBus._id;
          return scheduleBusId === driverBusId;
        });

        setCompletedTripsCount(completedSchedules.length);
      } catch (completedError) {
        console.log('Error fetching completed trips count:', completedError);
        setCompletedTripsCount(0);
      }

    } catch (err: any) {
      console.error('Error fetching driver data:', err);
      setError(err.message || 'Failed to fetch driver data');
    } finally {
      setLoading(false);
    }
  };

  const updateOnlineStatus = async (isOnline: boolean): Promise<boolean> => {
    if (!bus) {
      console.error('No bus available for driver');
      return false;
    }

    try {
      console.log('Attempting to update online status:', { busId: bus.id, isOnline });
      await apiService.setDriverOnlineStatus(bus.id, isOnline);
      console.log('Online status updated successfully');
      setBus(prev => prev ? { ...prev, isOnline } : null);
      return true;
    } catch (err: any) {
      console.error('Error updating online status:', err);
      console.error('Error details:', {
        message: err.message,
        busId: bus?.id,
        busPlateNumber: bus?.plateNumber,
        isOnline
      });
      setError(err.message || 'Failed to update online status');
      return false;
    }
  };

  const updateBusLocation = async (
    latitude: number, 
    longitude: number, 
    speed: number = 0, 
    heading: number = 0, 
    accuracy: number = 0
  ): Promise<boolean> => {
    if (!bus) return false;

    try {
      await apiService.updateBusLocation(bus.id, latitude, longitude, speed, heading, accuracy);
      return true;
    } catch (err: any) {
      console.error('Error updating bus location:', err);
      setError(err.message || 'Failed to update location');
      return false;
    }
  };

  useEffect(() => {
    fetchDriverData();
    
    // Set up polling to refresh data every 10 seconds
    const interval = setInterval(fetchDriverData, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const refetch = () => {
    fetchDriverData();
  };

  return { 
    bus, 
    schedules, 
    passengers, 
    completedTripsCount,
    loading, 
    error, 
    refetch, 
    updateOnlineStatus, 
    updateBusLocation 
  };
}