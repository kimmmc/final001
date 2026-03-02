import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface Route {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  pickupPoints: any[];
  isActive: boolean;
}

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRoutes();
      setRoutes(response.routes.map(route => ({
        id: route._id,
        name: route.name,
        description: route.description,
        estimatedDuration: route.estimatedDuration,
        pickupPoints: route.pickupPoints,
        isActive: route.isActive,
      })));
    } catch (err: any) {
      console.error('Error fetching routes:', err);
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const refetch = () => {
    fetchRoutes();
  };

  return { routes, loading, error, refetch };
}