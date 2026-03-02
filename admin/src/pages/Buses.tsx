import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Bus as BusIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Users,
  Activity,
  AlertCircle,
  UserCheck,
  Navigation as RouteIcon,
  Navigation,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Bus {
  _id: string;
  plateNumber: string;
  capacity: number;
  fare: number;
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
  createdAt: string;
}

export default function Buses() {
  const { theme } = useTheme();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showBusModal, setShowBusModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: '',
    driverId: '',
    routeId: '',
  });

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getBuses();
      setBuses(response.buses);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to fetch buses');
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await apiService.getDrivers({ isActive: true });
      setDrivers(response.drivers);
    } catch (err: any) {
      console.error('Error fetching drivers:', err);
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

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plateNumber || !formData.capacity || !formData.driverId || !formData.routeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        plateNumber: formData.plateNumber,
        capacity: parseInt(formData.capacity),
        driverId: formData.driverId,
        routeId: formData.routeId,
      };

      if (selectedBus) {
        await apiService.updateBus(selectedBus._id, data);
        toast.success('Bus updated successfully');
      } else {
        await apiService.createBus(data);
        toast.success('Bus created successfully');
      }
      
      setShowBusModal(false);
      setSelectedBus(null);
      setFormData({
        plateNumber: '',
        capacity: '',
        driverId: '',
        routeId: '',
      });
      fetchBuses();
    } catch (err: any) {
      console.error('Error saving bus:', err);
      toast.error(err.message || 'Failed to save bus');
    }
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      plateNumber: bus.plateNumber,
      capacity: bus.capacity.toString(),
      driverId: typeof bus.driverId === 'string' ? bus.driverId : bus.driverId?._id || '',
      routeId: typeof bus.routeId === 'string' ? bus.routeId : bus.routeId?._id || '',
    });
    setShowBusModal(true);
  };

  const handleDeleteBus = async (bus: Bus) => {
    if (!window.confirm(`Are you sure you want to delete bus ${bus.plateNumber}?`)) {
      return;
    }

    try {
      await apiService.deleteBus(bus._id);
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (err: any) {
      console.error('Error deleting bus:', err);
      toast.error(err.message || 'Failed to delete bus');
    }
  };

  const filteredBuses = buses
    .filter(bus => bus.isActive)
    .filter(bus =>
      bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.driverId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.routeId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(bus => {
      if (statusFilter === 'active') return bus.isActive;
      if (statusFilter === 'inactive') return !bus.isActive;
      if (statusFilter === 'online') return bus.isOnline;
      if (statusFilter === 'offline') return !bus.isOnline;
      return true;
    });

  if (loading && buses.length === 0) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading buses...</p>
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
          <h1 className="admin-page-title">Buses Management</h1>
          <p className="admin-page-subtitle">Manage your bus fleet and assignments</p>
        </div>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setSelectedBus(null);
            setFormData({
              plateNumber: '',
              capacity: '',
              driverId: '',
              routeId: '',
            });
            setShowBusModal(true);
          }}
        >
          <Plus size={18} />
          Add Bus
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid admin-grid-4 admin-mb-6">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Buses
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <BusIcon size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Buses
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.filter(b => b.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <Activity size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Online Now
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.filter(b => b.isOnline).length}
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
                  Total Capacity
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.reduce((sum, bus) => sum + bus.capacity, 0)}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <Users size={24} style={{ color: theme.secondary }} />
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
              placeholder="Search buses..."
              className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button
            onClick={fetchBuses}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Filter size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Buses Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Buses ({filteredBuses.length})
          </h3>
          <p className="admin-card-subtitle">Active buses in your fleet</p>
        </div>
        <div className="admin-card-body">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Buses
                </h3>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchBuses}
                  className="admin-btn admin-btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <BusIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Buses Found
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your filters' 
                    : 'No buses have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Capacity</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map((bus) => (
                    <tr key={bus._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: bus.isOnline ? theme.success + '20' : theme.textSecondary + '20' }}
                          >
                            <BusIcon size={20} style={{ color: bus.isOnline ? theme.success : theme.textSecondary }} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.text }}>
                              {bus.plateNumber}
                            </p>
                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                              ID: {bus._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {bus.driverId ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <UserCheck size={14} style={{ color: theme.primary }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm" style={{ color: theme.text }}>
                                {bus.driverId.name || 'Unknown Driver'}
                              </p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                {bus.driverId.phone || 'No phone'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge-secondary">
                            No driver
                          </span>
                        )}
                      </td>
                      <td>
                        {bus.routeId ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: theme.secondary + '20' }}
                            >
                              <RouteIcon size={14} style={{ color: theme.secondary }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm" style={{ color: theme.text }}>
                                {bus.routeId.name || 'Unknown Route'}
                              </p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                {bus.routeId.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge-secondary">
                            No route
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Users size={14} style={{ color: theme.textSecondary }} />
                          <span className="text-sm" style={{ color: theme.text }}>{bus.capacity}</span>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-1">
                          <span className="text-sm" style={{ color: theme.text }}>
                            {bus.routeId?.fare || 400} RWF
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-space-y-1">
                          <span className={`admin-badge ${bus.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                            {bus.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`admin-badge ${bus.isOnline ? 'admin-badge-success' : 'admin-badge-secondary'}`}>
                            {bus.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditBus(bus)}
                            className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            title="Edit Bus"
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
                            onClick={() => handleDeleteBus(bus)}
                            className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            title="Delete Bus"
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

      {/* Bus Modal */}
      {showBusModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              {selectedBus ? 'Edit Bus' : 'Add New Bus'}
            </h2>
            <form onSubmit={handleCreateBus} className="admin-space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Plate Number
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="e.g., RAD 123 A"
                  required
                />
              </div>

              <div className="admin-grid admin-grid-2">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 30"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Fare
                  </label>
                  <div className="admin-input" style={{ 
                    backgroundColor: theme.surface + '50',
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'not-allowed'
                  }}>
                    Inherited from selected route
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Driver
                </label>
                <select
                  className="admin-select"
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  required
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} - {driver.email}
                    </option>
                  ))}
                </select>
              </div>

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
                      {route.name} - {route.description}
                    </option>
                  ))}
                </select>
              </div>



              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="admin-btn admin-btn-primary flex-1">
                  {selectedBus ? 'Update Bus' : 'Create Bus'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBusModal(false)}
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