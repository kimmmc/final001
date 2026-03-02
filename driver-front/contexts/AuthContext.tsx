import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('driver_user');
      const storedToken = await AsyncStorage.getItem('driver_authToken');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token is still valid
        try {
          const profileResponse = await apiService.getProfile();
          if (profileResponse.user.role !== 'driver') {
            throw new Error('Not a driver account');
          }
          setUser(profileResponse.user);
        } catch (error) {
          // Token is invalid or not a driver, clear stored data
          await AsyncStorage.removeItem('driver_user');
          await AsyncStorage.removeItem('driver_authToken');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await apiService.login(email, password);
      
      // Check if user is a driver
      if (response.user.role !== 'driver') {
        throw new Error('Access denied. Driver account required.');
      }
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('driver_user', JSON.stringify(userData));
      await AsyncStorage.setItem('driver_authToken', response.token);
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated');
      
      // Call backend logout endpoint
      try {
        await apiService.logout();
        console.log('Backend logout completed');
      } catch (error) {
        console.log('Backend logout failed (this is okay):', error);
      }
      
      // Clear user state first
      setUser(null);
      
      // Clear all stored data
      await AsyncStorage.removeItem('driver_user');
      await AsyncStorage.removeItem('driver_authToken');
      
      // Clear any other potential stored data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('token');
      
      console.log('Logout completed - all data cleared');
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}