import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Bus,
  Navigation as RouteIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BusSchedule {
  _id: string;
  busId: any;
  routeId: any;
  departureTime: string;
  estimatedArrivalTimes: Array<{
    pickupPointId: any;
    estimatedTime: string;
    actualTime?: string;
  }>;
  status: string;
  createdAt: string;
}

export default function Schedules() {
  const { theme } = useTheme();
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    busId: '',
    routeId: '',
    departureTime: '',
    estimatedArrivalTimes: [] as Array<{ pickupPointId: string; estimatedTime: string }>,
  });
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
    fetchRoutes();
  }, [statusFilter, routeFilter, dateFilter]);

  useEffect(() => {
    const fetchPickupPoints = async () => {
      if (!scheduleForm.routeId) {
        setPickupPoints([]);
        return;
      }
      try {
        const response = await apiService.getPickupPoints(scheduleForm.routeId);
        setPickupPoints(response.pickupPoints || []);
      } catch (err) {
        setPickupPoints([]);
      }
    };
    fetchPickupPoints();
  }, [scheduleForm.routeId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (routeFilter) params.routeId = routeFilter;
      if (dateFilter) params.date = dateFilter;
      
      const response = await apiService.getBusSchedules(params);
      console.log(response);
      setSchedules(response.schedules);
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err.message || 'Failed to fetch schedules');
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await apiService.getBuses();
      setBuses(response.buses.filter(bus => bus.isActive));
    } catch (err: any) {
      console.error('Error fetching buses:', err);
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

  const handleDeleteSchedule = async (schedule: BusSchedule) => {
    if (!window.confirm('Are you sure you want to cancel this schedule?')) {
      return;
    }

    try {
      await apiService.deleteBusSchedule(schedule._id);
      toast.success('Schedule cancelled successfully');
      fetchSchedules();
    } catch (err: any) {
      console.error('Error cancelling schedule:', err);
      toast.error(err.message || 'Failed to cancel schedule');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'in-transit':
        return theme.warning;
      case 'cancelled':
        return theme.error;
      default:
        return theme.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-transit':
        return Play;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getBusName = (busId: any) => {
    if (typeof busId === 'string') {
      const bus = buses.find(b => b._id === busId);
      return bus ? bus.plateNumber : 'Unknown Bus';
    }
    return busId?.plateNumber || 'Unknown Bus';
  };

  const getRouteName = (routeId: any) => {
    if (typeof routeId === 'string') {
      const route = routes.find(r => r._id === routeId);
      return route ? route.name : 'Unknown Route';
    }
    return routeId?.name || 'Unknown Route';
  };

  const filteredSchedules = schedules.filter(schedule => {
    const busName = getBusName(schedule.busId);
    const routeName = getRouteName(schedule.routeId);
    
    // Search filter
    const matchesSearch = busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    
    // Route filter
    const matchesRoute = !routeFilter || schedule.routeId === routeFilter || 
                        (typeof schedule.routeId === 'object' && schedule.routeId._id === routeFilter);
    
    // Date filter
    const matchesDate = !dateFilter || 
                       new Date(schedule.departureTime).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesStatus && matchesRoute && matchesDate;
  });

  const handleOpenModal = () => {
    setScheduleForm({
      busId: '',
      routeId: '',
      departureTime: '',
      estimatedArrivalTimes: [],
    });
    setPickupPoints([]);
    setShowScheduleModal(true);
  };

  const handleScheduleFormChange = (field: string, value: any) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEstimatedTimeChange = (pickupPointId: string, value: string) => {
    setScheduleForm((prev) => ({
      ...prev,
      estimatedArrivalTimes: prev.estimatedArrivalTimes.map((item) =>
        item.pickupPointId === pickupPointId ? { ...item, estimatedTime: value } : item
      ),
    }));
  };

  const handleAddEstimatedTime = (pickupPointId: string) => {
    setScheduleForm((prev) => ({
      ...prev,
      estimatedArrivalTimes: [
        ...prev.estimatedArrivalTimes,
        { pickupPointId, estimatedTime: '' },
      ],
    }));
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.busId || !scheduleForm.routeId || !scheduleForm.departureTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (pickupPoints.length > 0 && scheduleForm.estimatedArrivalTimes.length !== pickupPoints.length) {
      toast.error('Please provide estimated times for all pickup points');
      return;
    }
    setCreating(true);
    try {
      // Combine date and time for each pickup point
      const baseDate = scheduleForm.departureTime.split('T')[0];
      const estimatedArrivalTimes = scheduleForm.estimatedArrivalTimes.map(item => ({
        pickupPointId: item.pickupPointId,
        estimatedTime: `${baseDate}T${item.estimatedTime}:00`, // e.g., '2024-07-08T15:30:00'
      }));
      await apiService.createBusSchedule({
        busId: scheduleForm.busId,
        routeId: scheduleForm.routeId,
        departureTime: scheduleForm.departureTime,
        estimatedArrivalTimes,
      });
      toast.success('Bus schedule created successfully');
      setShowScheduleModal(false);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create schedule');
    } finally {
      setCreating(false);
    }
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-section">
          <h1 className="admin-page-title">Bus Schedules</h1>
          <p className="admin-page-subtitle">Manage bus schedules and departure times</p>
        </div>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={handleOpenModal}
        >
          <Plus size={18} />
          Add Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-grid admin-grid-4 admin-mb-6">
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Schedules
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {schedules.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <Calendar size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Scheduled
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {schedules.filter(s => s.status === 'scheduled').length}
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

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  In Transit
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {schedules.filter(s => s.status === 'in-transit').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <Play size={24} style={{ color: theme.warning }} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Completed
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {schedules.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <CheckCircle size={24} style={{ color: theme.success }} />
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
              placeholder="Search schedules..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in-transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
          <input
            type="date"
            className="admin-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button
            onClick={fetchSchedules}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Filter size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Schedules ({filteredSchedules.length})
          </h3>
          <p className="admin-card-subtitle">All bus schedules and their status</p>
        </div>
        <div className="admin-card-body">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Schedules
                </h3>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchSchedules}
                  className="admin-btn admin-btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Schedules Found
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || statusFilter || routeFilter || dateFilter
                    ? 'Try adjusting your filters' 
                    : 'No schedules have been created yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table" style={{ borderSpacing: '0 8px', borderCollapse: 'separate' }}>
                <thead>
                  <tr>
                    <th className="text-left" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Bus & Route</th>
                    <th className="text-left" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Departure Time</th>
                    <th className="text-center" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Status</th>
                    <th className="text-left" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Stops</th>
                    <th className="text-left" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Created</th>
                    <th className="text-center" style={{ padding: '20px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                                  <tbody>
                    {filteredSchedules.map((schedule) => {
                      const StatusIcon = getStatusIcon(schedule.status);
                      const statusColor = getStatusColor(schedule.status);
                      
                      return (
                        <tr 
                          key={schedule._id}
                          className="hover:shadow-lg transition-all duration-200"
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            marginBottom: '8px'
                          }}
                        >
                        <td style={{ padding: '16px 20px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: statusColor + '12' }}
                            >
                              <Bus size={22} style={{ color: statusColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base" style={{ color: theme.text }}>
                                {getBusName(schedule.busId)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <RouteIcon size={14} style={{ color: theme.secondary }} />
                                <span className="text-sm" style={{ color: theme.textSecondary }}>
                                  {getRouteName(schedule.routeId)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: theme.primary + '15' }}
                            >
                              <Clock size={18} style={{ color: theme.primary }} />
                            </div>
                            <div>
                              <p className="font-medium text-base" style={{ color: theme.text }}>
                                {new Date(schedule.departureTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-sm" style={{ color: theme.textSecondary }}>
                                {new Date(schedule.departureTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div 
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                            style={{ 
                              backgroundColor: statusColor + '15',
                              color: statusColor,
                              border: `1px solid ${statusColor + '25'}`,
                              minWidth: '120px',
                              justifyContent: 'center'
                            }}
                          >
                            <StatusIcon size={14} className="mr-2 flex-shrink-0" />
                            <span className="capitalize">{schedule.status.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: theme.warning + '15' }}
                            >
                              <MapPin size={18} style={{ color: theme.warning }} />
                            </div>
                            <div>
                              <p className="font-medium text-base" style={{ color: theme.text }}>
                                {schedule.estimatedArrivalTimes.length} stops
                              </p>
                              <p className="text-sm" style={{ color: theme.textSecondary }}>
                                {schedule.estimatedArrivalTimes.length > 1 ? 'Multiple pickup points' : 'Single pickup point'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: theme.secondary + '15' }}
                            >
                              <Calendar size={18} style={{ color: theme.secondary }} />
                            </div>
                            <div>
                              <p className="font-medium text-base" style={{ color: theme.text }}>
                                {new Date(schedule.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm" style={{ color: theme.textSecondary }}>
                                {new Date(schedule.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              className="admin-btn admin-btn-secondary p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                              title="Edit Schedule"
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
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                              title="Delete Schedule"
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating schedule */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              Create New Bus Schedule
            </h2>
            <form onSubmit={handleCreateSchedule} className="admin-space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Bus
                </label>
                <select
                  className="admin-select"
                  value={scheduleForm.busId}
                  onChange={e => handleScheduleFormChange('busId', e.target.value)}
                  required
                >
                  <option value="">Select a bus</option>
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.plateNumber}
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
                  value={scheduleForm.routeId}
                  onChange={e => handleScheduleFormChange('routeId', e.target.value)}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map(route => (
                    <option key={route._id} value={route._id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Departure Time
                </label>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={scheduleForm.departureTime}
                  onChange={e => handleScheduleFormChange('departureTime', e.target.value)}
                  required
                />
              </div>
              {pickupPoints.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    Estimated Arrival Times (for each pickup point)
                  </label>
                  <div className="admin-space-y-2">
                    {pickupPoints.map((point, idx) => {
                      const existing = scheduleForm.estimatedArrivalTimes.find(e => e.pickupPointId === point._id);
                      return (
                        <div key={point._id} className="flex items-center gap-2">
                          <span className="w-40 text-sm" style={{ color: theme.textSecondary }}>{point.name}</span>
                          <input
                            type="time"
                            className="admin-input"
                            value={existing?.estimatedTime || ''}
                            onChange={e => {
                              if (existing) {
                                handleEstimatedTimeChange(point._id, e.target.value);
                              } else {
                                handleAddEstimatedTime(point._id);
                                setTimeout(() => handleEstimatedTimeChange(point._id, e.target.value), 0);
                              }
                            }}
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="admin-btn admin-btn-primary flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="admin-btn admin-btn-secondary flex-1"
                  disabled={creating}
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