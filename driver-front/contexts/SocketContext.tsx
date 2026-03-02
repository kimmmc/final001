import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useDriverData } from '@/hooks/useDriverData';
import socketService from '@/services/socketService';

interface SocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { bus, refetch } = useDriverData();
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    if (!user || user.role !== 'driver' || !bus) {
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        console.log('No auth token available for socket connection');
        return;
      }

      console.log('Connecting to socket with bus ID:', bus.id);
      socketService.connect(token, bus.id);

      // Set up event listeners
      socketService.onConnected(() => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      socketService.onDisconnected(() => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketService.onError((error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for user interest updates
      socketService.onUserInterestUpdated((data) => {
        console.log('Received user interest update:', data);

        // Show notification to driver
        Alert.alert(
          'New Passenger Interest! 🚌',
          `${data.userName} is interested in your bus at ${data.pickupPointName}`,
          [
            { text: 'View Passengers', onPress: () => refetch() },
            { text: 'OK' }
          ]
        );

        // Refresh passenger data
        refetch();
      });

    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('driver_authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Connect when user is authenticated and bus is available
  useEffect(() => {
    if (user && user.role === 'driver' && bus) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, bus]);

  const value: SocketContextType = {
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 