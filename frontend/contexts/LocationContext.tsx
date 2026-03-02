import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
    // Automatically request location when app starts
    autoRequestLocation();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll use browser geolocation API
      setHasPermission(true);
      return;
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking location permissions:', err);
      setError('Failed to check location permissions');
    }
  };

  const autoRequestLocation = async () => {
    // Automatically request location when app starts
    try {
      if (Platform.OS === 'web') {
        // For web, try to get location automatically
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || undefined,
              });
              setHasPermission(true);
            },
            (error) => {
              console.log('Auto location request failed:', error);
              // Don't set error for auto-request failures
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        }
      } else {
        // For native platforms, try to get location automatically
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Try to request permission automatically
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus === 'granted') {
            setHasPermission(true);
            const locationData = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            setLocation({
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
              accuracy: locationData.coords.accuracy || undefined,
            });
          }
        } else {
          setHasPermission(true);
          const locationData = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy || undefined,
          });
        }
      }
    } catch (err) {
      console.log('Auto location request failed:', err);
      // Don't set error for auto-request failures
    }
  };

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        // Use browser geolocation API for web
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by this browser');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      } else {
        // Use Expo Location for native platforms
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setHasPermission(false);
          return;
        }

        setHasPermission(true);
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy || undefined,
        });
      }
    } catch (err: any) {
      console.error('Error getting location:', err);
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{
      location,
      loading,
      error,
      requestLocation,
      hasPermission,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}