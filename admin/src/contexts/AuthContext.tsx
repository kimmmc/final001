import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

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
  logout: () => void;
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
      const storedUser = localStorage.getItem('admin_user');
      const storedToken = localStorage.getItem('admin_authToken');
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token is still valid
        try {
          const profileResponse = await apiService.getProfile();
          if (profileResponse.user.role !== 'admin') {
            throw new Error('Not an admin account');
          }
          setUser(profileResponse.user);
        } catch (error) {
          // Token is invalid or not an admin, clear stored data
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_authToken');
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
      
      // Check if user is an admin
      if (response.user.role !== 'admin') {
        toast.error('Access denied. Admin account required.');
        return false;
      }
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
      };
      
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      localStorage.setItem('admin_authToken', response.token);
      
      toast.success('Welcome to UBMS Admin Dashboard!');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_authToken');
    toast.success('Logged out successfully');
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