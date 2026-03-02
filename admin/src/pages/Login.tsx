import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Bus, Eye, EyeOff, Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.background }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.primary} 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden"
                style={{ 
                  backgroundColor: theme.primary,
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}DD 100%)`
                }}
              >
                <Bus size={32} color="white" className="relative z-10" />
                <div className="absolute inset-0 bg-white opacity-10 rounded-2xl transform rotate-45 scale-150"></div>
              </div>
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#10B981' }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ color: theme.text }}>
              UBMS Admin
            </h1>
            <p className="text-lg font-medium" style={{ color: theme.textSecondary }}>
              Professional Dashboard Management System
            </p>
            <div className="mt-3 flex items-center justify-center">
              <div className="h-1 w-16 rounded-full" style={{ backgroundColor: theme.primary }}></div>
            </div>
          </div>

          {/* Login Card */}
          <div 
            className="relative rounded-2xl shadow-xl border backdrop-blur-sm overflow-hidden"
            style={{ 
              backgroundColor: theme.surface + 'F0',
              borderColor: theme.border + '40'
            }}
          >
            {/* Card Header */}
            <div 
              className="px-6 py-4 border-b"
              style={{ 
                backgroundColor: theme.primary + '08',
                borderColor: theme.border + '30'
              }}
            >
              <div className="flex items-center justify-center">
                <Shield size={18} style={{ color: theme.primary }} className="mr-2" />
                <span className="text-base font-bold" style={{ color: theme.primary }}>
                  Secure Administrator Access
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="text-xs font-bold uppercase tracking-wide flex items-center"
                    style={{ color: theme.text }}
                  >
                    <Mail size={14} className="mr-2" style={{ color: theme.primary }} />
                    Administrator Email
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 text-base font-medium transition-all duration-300 focus:outline-none focus:scale-[1.01] group-hover:shadow-md"
                      placeholder="admin@ubms.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.primary;
                        e.target.style.boxShadow = `0 0 0 4px ${theme.primary}15`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label 
                    htmlFor="password" 
                    className="text-xs font-bold uppercase tracking-wide flex items-center"
                    style={{ color: theme.text }}
                  >
                    <Lock size={14} className="mr-2" style={{ color: theme.primary }} />
                    Secure Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 text-base font-medium transition-all duration-300 focus:outline-none focus:scale-[1.01] group-hover:shadow-md"
                      placeholder="Enter your secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.primary;
                        e.target.style.boxShadow = `0 0 0 4px ${theme.primary}15`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ 
                        color: theme.textSecondary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primary + '15';
                        e.currentTarget.style.color = theme.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme.textSecondary;
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl text-base font-bold transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                        e.currentTarget.style.boxShadow = `0 15px 30px ${theme.primary}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Authenticating Access...
                        </>
                      ) : (
                        <>
                          Access Admin Dashboard
                          <ArrowLeft size={18} className="ml-2 transform rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>

            {/* Card Footer */}
            <div 
              className="px-6 py-4 border-t text-center"
              style={{ 
                backgroundColor: theme.surface + '80',
                borderColor: theme.border + '30'
              }}
            >
              <div 
                className="inline-flex items-center justify-center p-3 rounded-xl mb-3"
                style={{ backgroundColor: theme.primary + '10' }}
              >
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: theme.primary }}>
                    🔒 Restricted Access Zone
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                    Authorized personnel only • Contact system admin for access
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs" style={{ color: theme.textSecondary }}>
                <span className="font-semibold">UBMS Admin Dashboard</span>
                <span>•</span>
                <span>v1.0.0</span>
                <span>•</span>
                <span className="font-medium">Rwanda Bus Platform</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Notice */}
          <div className="mt-6 text-center">
            <div 
              className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: theme.primary + '15',
                color: theme.primary
              }}
            >
              <Shield size={12} className="mr-1.5" />
              Enterprise-grade security enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}