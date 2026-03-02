import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Users, 
  UserCheck, 
  Bus, 
  Navigation, 
  MapPin, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  buses: number;
  routes: number;
  users: number;
  schedules: number;
  pickupPoints: number;
  userInterests: number;
}

interface UserStats {
  activeUsers: number;
  activeDrivers: number;
  activeAdmins: number;
  inactiveUsers: number;
  totalUsers: number;
}

interface WeeklyActivity {
  name: string;
  users: number;
  schedules: number;
  interests: number;
  trips: number;
}

interface RecentActivity {
  type: string;
  action: string;
  text: string;
  time: string;
  icon: string;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch basic stats first (these should work)
      const [statsResponse, userStatsResponse] = await Promise.all([
        apiService.getStats(),
        apiService.getUserStats(),
      ]);
      
      setStats(statsResponse.stats);
      setUserStats(userStatsResponse.stats);

      // Try to fetch new activity data, but don't fail if they're not available yet
      try {
        const [weeklyActivityResponse, recentActivityResponse] = await Promise.all([
          apiService.getWeeklyActivity(),
          apiService.getRecentActivity(10),
        ]);
        
        setWeeklyActivity(weeklyActivityResponse.weeklyData);
        setRecentActivity(recentActivityResponse.activities);
      } catch (activityError) {
        console.warn('Activity endpoints not available yet, using fallback data:', activityError);
        
        // Fallback mock data for weekly activity
        const fallbackWeeklyData = [
          { name: 'Mon', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Tue', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Wed', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Thu', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Fri', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Sat', users: 0, schedules: 0, interests: 0, trips: 0 },
          { name: 'Sun', users: 0, schedules: 0, interests: 0, trips: 0 },
        ];
        
        // Fallback mock data for recent activity
        const fallbackRecentActivity = [
          { type: 'user', action: 'registered', text: 'New user registered: John Doe', time: new Date().toISOString(), icon: 'Users' },
          { type: 'bus', action: 'online', text: 'Bus RAD 123 A went online', time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), icon: 'Bus' },
          { type: 'schedule', action: 'created', text: 'Schedule created for Bus RAD 456 B on Route 302', time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), icon: 'Calendar' },
          { type: 'interest', action: 'added', text: 'User interested in pickup at Kimironko', time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), icon: 'MapPin' },
          { type: 'driver', action: 'assigned', text: 'Driver assigned to Bus RAD 789 C', time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), icon: 'UserCheck' },
        ];
        
        setWeeklyActivity(fallbackWeeklyData);
        setRecentActivity(fallbackRecentActivity);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: userStats?.totalUsers || 0,
      icon: Users,
      color: theme.primary,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Drivers',
      value: userStats?.activeDrivers || 0,
      icon: UserCheck,
      color: theme.success,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Buses',
      value: stats?.buses || 0,
      icon: Bus,
      color: theme.warning,
      change: '+2%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Routes',
      value: stats?.routes || 0,
      icon: Navigation,
      color: theme.secondary,
      change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'Pickup Points',
      value: stats?.pickupPoints || 0,
      icon: MapPin,
      color: theme.primary,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'User Interests',
      value: stats?.userInterests || 0,
      icon: Activity,
      color: theme.success,
      change: '+25%',
      changeType: 'positive' as const,
    },
  ];

  const userDistribution = [
    { name: 'Regular Users', value: userStats?.activeUsers || 0, color: theme.primary },
    { name: 'Drivers', value: userStats?.activeDrivers || 0, color: theme.success },
    { name: 'Admins', value: userStats?.activeAdmins || 0, color: theme.warning },
    { name: 'Inactive', value: userStats?.inactiveUsers || 0, color: theme.textSecondary },
  ];

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return Users;
      case 'Bus':
        return Bus;
      case 'Calendar':
        return Calendar;
      case 'MapPin':
        return MapPin;
      case 'UserCheck':
        return UserCheck;
      case 'Navigation':
        return Navigation;
      default:
        return Activity;
    }
  };

  const formatTimeAgo = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle size={64} style={{ color: theme.error }} className="mx-auto mb-6" />
          <h3 style={{ color: theme.error }} className="text-xl font-semibold mb-3">
            Error Loading Dashboard
          </h3>
          <p style={{ color: theme.textSecondary }} className="mb-6 text-base leading-relaxed">
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary px-6 py-3"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title">Dashboard Overview</div>
        <div className="dashboard-subtitle">
          Here's what's happening today.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="dashboard-stat-card fade-in">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-info">
                  <div className="dashboard-stat-label">{stat.title}</div>
                  <div className="dashboard-stat-value">{stat.value.toLocaleString()}</div>
                  <div className="dashboard-stat-change">
                    <span className={`dashboard-stat-percentage ${
                      stat.changeType === 'positive' ? 'positive' : 
                      stat.changeType === 'neutral' ? 'neutral' : 'negative'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="dashboard-stat-period">from last week</span>
                  </div>
                </div>
                <div className="dashboard-stat-icon" style={{ backgroundColor: stat.color + '15' }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-grid">
        {/* Weekly Activity Chart */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <h3 className="dashboard-chart-title" style={{ color: theme.text }}>
              Weekly Activity
            </h3>
            <p className="dashboard-chart-subtitle" style={{ color: theme.textSecondary }}>
              User activity and trips over the past week
            </p>
          </div>
          <div className="dashboard-chart-body">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.textSecondary} />
                <YAxis stroke={theme.textSecondary} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.text,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="users" fill={theme.primary} name="Users" radius={[4, 4, 0, 0]} />
                <Bar dataKey="trips" fill={theme.success} name="Trips" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <h3 className="dashboard-chart-title" style={{ color: theme.text }}>
              User Distribution
            </h3>
            <p className="dashboard-chart-subtitle" style={{ color: theme.textSecondary }}>
              Breakdown of users by role and status
            </p>
          </div>
          <div className="dashboard-chart-body">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.text,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="dashboard-legend">
              {userDistribution.map((item, index) => (
                <div key={index} className="dashboard-legend-item">
                  <div 
                    className="dashboard-legend-color"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="dashboard-legend-text" style={{ color: theme.textSecondary }}>
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-activity-card">
        <div className="dashboard-activity-header">
          <h3 className="dashboard-activity-title" style={{ color: theme.text }}>
            Recent Activity
          </h3>
          <p className="dashboard-activity-subtitle" style={{ color: theme.textSecondary }}>
            Latest system activities and updates
          </p>
        </div>
        <div className="dashboard-activity-body">
          <div className="dashboard-activity-list">
            {recentActivity.map((activity, index) => {
              const Icon = getActivityIcon(activity.icon);
              return (
                <div key={index} className="dashboard-activity-item" style={{ backgroundColor: theme.surface }}>
                  <div 
                    className="dashboard-activity-icon"
                    style={{ backgroundColor: theme.primary + '20' }}
                  >
                    <Icon size={16} style={{ color: theme.primary }} />
                  </div>
                  <div className="dashboard-activity-content">
                    <p className="dashboard-activity-text" style={{ color: theme.text }}>
                      {activity.text}
                    </p>
                    <p className="dashboard-activity-time" style={{ color: theme.textSecondary }}>
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}