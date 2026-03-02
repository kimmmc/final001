import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Navigation as RouteIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Route {
  _id: string;
  name: string;
  description: string;
  pickupPoints: any[];
  estimatedDuration: number;
  fare: number;
  isActive: boolean;
  createdAt: string;
}

export default function Routes() {
  const { theme } = useTheme();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedDuration: '',
    fare: '',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRoutes();
      setRoutes(response.routes);
    } catch (err: any) {
      console.error('Error fetching routes:', err);
      setError(err.message || 'Failed to fetch routes');
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.estimatedDuration) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        estimatedDuration: parseInt(formData.estimatedDuration),
        ...(formData.fare && { fare: parseInt(formData.fare) }),
      };

      if (selectedRoute) {
        await apiService.updateRoute(selectedRoute._id, data);
        toast.success('Route updated successfully');
      } else {
        await apiService.createRoute(data);
        toast.success('Route created successfully');
      }
      
      setShowRouteModal(false);
      setSelectedRoute(null);
      setFormData({
        name: '',
        description: '',
        estimatedDuration: '',
        fare: '',
      });
      fetchRoutes();
    } catch (err: any) {
      console.error('Error saving route:', err);
      toast.error(err.message || 'Failed to save route');
    }
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      description: route.description,
      estimatedDuration: route.estimatedDuration.toString(),
      fare: route.fare.toString(),
    });
    setShowRouteModal(true);
  };

  const handleDeleteRoute = async (route: Route) => {
    if (!window.confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteRoute(route._id);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (err: any) {
      console.error('Error deleting route:', err);
      toast.error(err.message || 'Failed to delete route');
    }
  };

  const filteredRoutes = routes
    .filter(route => route.isActive)
    .filter(route =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading && routes.length === 0) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading routes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-section">
          <h1 className="admin-page-title">Routes Management</h1>
          <p className="admin-page-subtitle">Manage bus routes and their configurations</p>
        </div>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setSelectedRoute(null);
            setFormData({
              name: '',
              description: '',
              estimatedDuration: '',
              fare: '',
            });
            setShowRouteModal(true);
          }}
        >
          <Plus size={18} />
          Add Route
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid admin-grid-4 admin-mb-6">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Routes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Routes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.filter(r => r.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Pickup Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.reduce((sum, route) => sum + route.pickupPoints.length, 0)}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <MapPin size={24} style={{ color: theme.warning }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Avg Duration
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length > 0 
                    ? Math.round(routes.reduce((sum, route) => sum + route.estimatedDuration, 0) / routes.length)
                    : 0
                  } min
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <Clock size={24} style={{ color: theme.secondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters-grid">
          <div className="admin-input-with-icon">
            <Search size={16} className="admin-input-icon" />
            <input
              type="text"
              placeholder="Search routes..."
              className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchRoutes}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Filter size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="admin-grid admin-grid-3">
        {error ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
              <h3 style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                Error Loading Routes
              </h3>
              <p style={{ color: theme.textSecondary }} className="mb-4">
                {error}
              </p>
              <button
                onClick={fetchRoutes}
                className="admin-btn admin-btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center">
              <RouteIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
              <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                No Routes Found
              </h3>
              <p style={{ color: theme.textSecondary }}>
                {searchTerm 
                  ? 'Try adjusting your search' 
                  : 'No routes have been added yet'
                }
              </p>
            </div>
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <div
              key={route._id}
              className="admin-card route-card-redesign"
              style={{
                borderLeft: `6px solid ${route.isActive ? theme.primary : theme.error}`,
                boxShadow: '0 4px 24px rgba(22, 105, 122, 0.10)',
                padding: '1.5rem 1.5rem 1.25rem 1.25rem',
                marginBottom: '1.5rem',
                position: 'relative',
                transition: 'box-shadow 0.2s',
                minHeight: 210,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Top section: Icon, Name, Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: route.isActive ? theme.primary + '22' : theme.error + '22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <RouteIcon size={26} style={{ color: route.isActive ? theme.primary : theme.error }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ color: theme.text, fontWeight: 700, fontSize: 20, margin: 0 }}>
                        {route.name}
                      </h3>
                      <span
                        className={`admin-badge ${route.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}
                        style={{ fontSize: 13, marginLeft: 4 }}
                      >
                        {route.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ color: theme.textSecondary, fontSize: 14, margin: '4px 0 0 0', maxWidth: 260 }}>
                      {route.description}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => handleEditRoute(route)}
                    className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    title="Edit Route"
                    style={{ 
                      minWidth: 44, 
                      minHeight: 44,
                      backgroundColor: theme.secondary + '15',
                      color: theme.secondary,
                      border: `1px solid ${theme.secondary + '25'}`
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoute(route)}
                    className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    title="Delete Route"
                    style={{ 
                      minWidth: 44, 
                      minHeight: 44,
                      backgroundColor: theme.error + '15',
                      color: theme.error,
                      border: `1px solid ${theme.error + '25'}`
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8f9fa',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginTop: 8,
                marginBottom: 0,
                gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} style={{ color: theme.primary }} />
                  <span style={{ color: theme.textSecondary, fontSize: 14 }}>Pickup Points</span>
                  <span style={{ color: theme.text, fontWeight: 600, fontSize: 15, marginLeft: 4 }}>{route.pickupPoints.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} style={{ color: theme.secondary }} />
                  <span style={{ color: theme.textSecondary, fontSize: 14 }}>Duration</span>
                  <span style={{ color: theme.text, fontWeight: 600, fontSize: 15, marginLeft: 4 }}>{route.estimatedDuration} min</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: theme.success, fontWeight: 600, fontSize: 15 }}>{route.fare} RWF</span>
                  <span style={{ color: theme.textSecondary, fontSize: 14 }}>Fare</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Route Modal */}
      {showRouteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              {selectedRoute ? 'Edit Route' : 'Add New Route'}
            </h2>
            <form onSubmit={handleCreateRoute} className="admin-space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Route Name
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Route 302"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Description
                </label>
                <textarea
                  className="admin-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Kimironko - Downtown/CBD"
                  rows={3}
                />
              </div>

              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="e.g., 45"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Fare (RWF)
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.fare}
                    onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                    placeholder="e.g., 400"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="admin-btn admin-btn-primary flex-1">
                  {selectedRoute ? 'Update Route' : 'Create Route'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="admin-btn admin-btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}