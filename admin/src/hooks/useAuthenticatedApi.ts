import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export function useAuthenticatedApi() {
  const { user, loading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set ready when user is authenticated and auth loading is complete
    if (user && !authLoading) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [user, authLoading]);

  return {
    isReady,
    user,
    authLoading,
    isAuthenticated: !!user && !authLoading
  };
} 