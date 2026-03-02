import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Navigation as RouteIcon,
  AlertCircle,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PickupPoint {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  routeId: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Route {
  _id: string;
  name: string;
  description: string;
}

export default function PickupPoints() {
  const { theme } = useTheme();
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    routeId: '',
    order: '',
  });

  useEffect(() => {
    fetchPickupPoints();
    fetchRoutes();
  }, [routeFilter]);

  const fetchPickupPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPickupPoints(routeFilter || undefined);
      setPickupPoints(response.pickupPoints);
    } catch (err: any) {
      console.error('Error fetching pickup points:', err);
      setError(err.message || 'Failed to fetch pickup points');
      toast.error('Failed to fetch pickup points');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await apiService.getRoutes();
      setRoutes(response.routes.filter(route => route.isActive));
    } catch (err: any) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleCreatePickupPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.routeId || !formData.order) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        routeId: formData.routeId,
        order: parseInt(formData.order),
      };

      if (selectedPickup) {
        await apiService.updatePickupPoint(selectedPickup._id, data);
        toast.success('Pickup point updated successfully');
      } else {
        await apiService.createPickupPoint(data);
        toast.success('Pickup point created successfully');
      }
      
      setShowPickupModal(false);
      setSelectedPickup(null);
      setFormData({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        routeId: '',
        order: '',
      });
      fetchPickupPoints();
    } catch (err: any) {
      console.error('Error saving pickup point:', err);
      toast.error(err.message || 'Failed to save pickup point');
    }
  };

  const handleEditPickupPoint = (pickup: PickupPoint) => {
    setSelectedPickup(pickup);
    setFormData({
      name: pickup.name,
      description: pickup.description,
      latitude: pickup.latitude.toString(),
      longitude: pickup.longitude.toString(),
      routeId: pickup.routeId,
      order: pickup.order.toString(),
    });
    setShowPickupModal(true);
  };

  const handleDeletePickupPoint = async (pickup: PickupPoint) => {
    if (!window.confirm(`Are you sure you want to delete pickup point "${pickup.name}"?`)) {
      return;
    }

    try {
      await apiService.deletePickupPoint(pickup._id);
      toast.success('Pickup point deleted successfully');
      fetchPickupPoints();
    } catch (err: any) {
      console.error('Error deleting pickup point:', err);
      toast.error(err.message || 'Failed to delete pickup point');
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r._id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const filteredPickupPoints = pickupPoints.filter(pickup =>
    pickup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && pickupPoints.length === 0) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading pickup points...</p>
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
          <h1 className="admin-page-title">Pickup Points Management</h1>
          <p className="admin-page-subtitle">Manage pickup points along bus routes</p>
        </div>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setSelectedPickup(null);
            setFormData({
              name: '',
              description: '',
              latitude: '',
              longitude: '',
              routeId: '',
              order: '',
            });
            setShowPickupModal(true);
          }}
        >
          <Plus size={18} />
          Add Pickup Point
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid admin-grid-4 admin-mb-6">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {pickupPoints.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <MapPin size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {pickupPoints.filter(p => p.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <Navigation size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Routes Covered
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {new Set(pickupPoints.map(p => p.routeId)).size}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.warning }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Avg per Route
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length > 0 
                    ? Math.round(pickupPoints.length / routes.length)
                    : 0
                  }
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <MapPin size={24} style={{ color: theme.secondary }} />
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
              placeholder="Search pickup points..."
              className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
          >
            <option value="">All Routes</option>
            {routes.map((route) => (
              <option key={route._id} value={route._id}>
                {route.name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchPickupPoints}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Filter size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Pickup Points Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Pickup Points ({filteredPickupPoints.length})
          </h3>
          <p className="admin-card-subtitle">All pickup points along bus routes</p>
        </div>
        <div className="admin-card-body">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Pickup Points
                </h3>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchPickupPoints}
                  className="admin-btn admin-btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredPickupPoints.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MapPin size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Pickup Points Found
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || routeFilter 
                    ? 'Try adjusting your filters' 
                    : 'No pickup points have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pickup Point</th>
                    <th>Route</th>
                    <th>Location</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPickupPoints.map((pickup) => (
                    <tr key={pickup._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: theme.primary + '20' }}
                          >
                            <MapPin size={20} style={{ color: theme.primary }} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.text }}>
                              {pickup.name}
                            </p>
                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                              {pickup.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: theme.secondary + '20' }}
                          >
                            <RouteIcon size={14} style={{ color: theme.secondary }} />
                          </div>
                          <span className="text-sm" style={{ color: theme.text }}>
                            {getRouteName(pickup.routeId)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <p style={{ color: theme.text }}>
                            {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}
                          </p>
                          <p className="text-xs" style={{ color: theme.textSecondary }}>
                            Lat/Lng coordinates
                          </p>
                        </div>
                      </td>
                      <td>
                        <div 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
                          style={{ 
                            backgroundColor: theme.primary + '20',
                            color: theme.primary 
                          }}
                        >
                          {pickup.order}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${pickup.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                          {pickup.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditPickupPoint(pickup)}
                            className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            title="Edit Pickup Point"
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
                            onClick={() => handleDeletePickupPoint(pickup)}
                            className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            title="Delete Pickup Point"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pickup Point Modal */}
      {showPickupModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              {selectedPickup ? 'Edit Pickup Point' : 'Add New Pickup Point'}
            </h2>
            <form onSubmit={handleCreatePickupPoint} className="admin-space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Name
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kimironko Market"
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
                  placeholder="Additional details about this pickup point"
                  rows={3}
                />
              </div>

              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="admin-input"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., -1.9441"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="admin-input"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., 30.1056"
                    required
                  />
                </div>
              </div>

              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Route
                  </label>
                  <select
                    className="admin-select"
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    required
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Order
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="e.g., 1"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="admin-btn admin-btn-primary flex-1">
                  {selectedPickup ? 'Update Pickup Point' : 'Create Pickup Point'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
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