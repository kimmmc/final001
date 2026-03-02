import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Activity,
  Shield,
  Car,
  Bus,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserStats {
  activeUsers: number;
  activeDrivers: number;
  activeAdmins: number;
  inactiveUsers: number;
  totalUsers: number;
}

export default function Users() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchBuses();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      
      const response = await apiService.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination || null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getUserStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await apiService.getBuses();
      setBuses(response.buses);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await apiService.updateUserStatus(user._id, !user.isActive);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await apiService.updateUserRole(user._id, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await apiService.deleteUser(user._id);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Simple email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(createForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setCreateLoading(true);
    try {
      await apiService.createUser({
        ...createForm,
      });
      toast.success(`${createForm.role === 'driver' ? 'Driver' : 'User'} created successfully`);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'user' });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || `Failed to create ${createForm.role}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const getDriverBus = (driverId: string) => {
    return buses.find(bus => 
      (bus.driverId?._id === driverId || bus.driverId?.id === driverId || bus.driverId === driverId) && 
      bus.isActive
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'admin-badge-danger';
      case 'driver':
        return 'admin-badge-warning';
      default:
        return 'admin-badge-primary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'driver':
        return Car;
      default:
        return UsersIcon;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted">Loading users...</p>
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
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">Manage all users, drivers, and administrators</p>
        </div>
        <button 
          className="admin-btn admin-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="admin-grid admin-grid-4 admin-mb-6">
          <div className="admin-card">
            <div className="admin-card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    Total Users
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                    {stats.totalUsers}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <UsersIcon size={24} style={{ color: theme.primary }} />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    Active Drivers
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                    {stats.activeDrivers}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.warning + '20' }}
                >
                  <Car size={24} style={{ color: theme.warning }} />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    Regular Users
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                    {stats.activeUsers}
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
                    Administrators
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                    {stats.activeAdmins}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.error + '20' }}
                >
                  <Shield size={24} style={{ color: theme.error }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters-grid">
          <div className="admin-input-with-icon">
            <Search size={16} className="admin-input-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={fetchUsers}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <Filter size={16} />}
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Users ({pagination?.totalUsers || filteredUsers.length})
          </h3>
          <p className="admin-card-subtitle">Complete list of all system users</p>
        </div>
        <div className="admin-card-body">
          {error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Users
                </h3>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchUsers}
                  className="admin-btn admin-btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <UsersIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <h3 style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Users Found
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || roleFilter || statusFilter 
                    ? 'Try adjusting your filters' 
                    : 'No users have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const assignedBus = user.role === 'driver' ? getDriverBus(user._id) : null;
                    const RoleIcon = getRoleIcon(user.role);
                    
                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <span className="font-semibold text-sm" style={{ color: theme.primary }}>
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: theme.text }}>
                                {user.name}
                              </p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                ID: {user._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail size={14} style={{ color: theme.textSecondary }} />
                              <span className="text-sm" style={{ color: theme.text }}>
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} style={{ color: theme.textSecondary }} />
                              <span className="text-sm" style={{ color: theme.text }}>
                                {user.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.role === 'driver' ? (
                            assignedBus ? (
                              <div className="flex items-center gap-2">
                                <Bus size={14} style={{ color: theme.warning }} />
                                <div>
                                  <span className="text-sm font-medium" style={{ color: theme.text }}>
                                    {assignedBus.plateNumber}
                                  </span>
                                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                                    {assignedBus.routeId?.name || 'No route'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="admin-badge admin-badge-secondary">
                                Unassigned
                              </span>
                            )
                          ) : (
                            <span className="text-sm" style={{ color: theme.textSecondary }}>
                              N/A
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className={`admin-badge ${user.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck size={12} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX size={12} className="mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} style={{ color: theme.textSecondary }} />
                            <span className="text-sm" style={{ color: theme.text }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleStatusToggle(user)}
                              className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                              style={{ 
                                minWidth: 44, 
                                minHeight: 44,
                                backgroundColor: theme.secondary + '15',
                                color: theme.secondary,
                                border: `1px solid ${theme.secondary + '25'}`
                              }}
                            >
                              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="admin-btn p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                              title="Delete User"
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="admin-card">
          <div className="admin-card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalUsers} total users)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="admin-btn admin-btn-secondary"
                >
                  Previous
                </button>
                <span className="text-sm font-medium px-3 py-1">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="admin-btn admin-btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              Add New User
            </h2>
            <form onSubmit={handleCreateUser} className="admin-space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  User Type
                </label>
                <select
                  className="admin-input"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  required
                >
                  <option value="user">Regular User</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="admin-input"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="admin-input"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-input pr-10"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="admin-btn admin-btn-primary flex-1"
                >
                  {createLoading ? <div className="spinner" /> : null}
                  {createLoading ? 'Creating...' : `Create ${createForm.role === 'driver' ? 'Driver' : createForm.role === 'admin' ? 'Admin' : 'User'}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: '', email: '', phone: '', password: '', role: 'user' });
                    setShowPassword(false);
                  }}
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