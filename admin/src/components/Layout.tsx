import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Bus,
  Navigation,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Buses', href: '/buses', icon: Bus },
  { name: 'Routes', href: '/routes', icon: Navigation },
  { name: 'Pickup Points', href: '/pickup-points', icon: MapPin },
  { name: 'Schedules', href: '/schedules', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-gradient-to-b from-white via-surface to-surface shadow-lg z-40 border-r border-light" style={{ height: '100vh', minHeight: '100vh' }}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-light flex-shrink-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary tracking-tight">UBMS Admin</h1>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors gap-3 group relative ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary shadow-sm' : 'text-muted hover:bg-primary/5 hover:text-primary'}`}
                style={{ minHeight: 48 }}
              >
                <span className={`absolute left-0 top-0 h-full w-1 rounded-r-lg ${isActive ? 'bg-primary' : 'group-hover:bg-primary/40'}`}></span>
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        {/* User info and logout */}
        <div className="p-6 border-t border-light flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-semibold shadow">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate font-light">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            style={{ 
              backgroundColor: theme.error + '15',
              color: theme.error,
              border: `1px solid ${theme.error + '25'}`
            }}
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      {/* Mobile sidebar overlay and drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gradient-to-b from-white via-surface to-surface shadow-lg border-r border-light flex flex-col" style={{ height: '100vh', minHeight: '100vh' }}>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-light flex-shrink-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary tracking-tight">UBMS Admin</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted">
                <X size={20} />
              </button>
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors gap-3 group relative ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary shadow-sm' : 'text-muted hover:bg-primary/5 hover:text-primary'}`}
                    style={{ minHeight: 48 }}
                  >
                    <span className={`absolute left-0 top-0 h-full w-1 rounded-r-lg ${isActive ? 'bg-primary' : 'group-hover:bg-primary/40'}`}></span>
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            {/* User info and logout */}
            <div className="p-6 border-t border-light flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-semibold shadow">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted truncate font-light">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                style={{ 
                  backgroundColor: theme.error + '15',
                  color: theme.error,
                  border: `1px solid ${theme.error + '25'}`
                }}
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Topbar */}
        <header className="h-16 flex items-center px-8 bg-white border-b border-light shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 rounded-xl text-muted hover:bg-primary/10 hover:text-primary transition-all duration-200">
              <Menu size={20} />
            </button>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}