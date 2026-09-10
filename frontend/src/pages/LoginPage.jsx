import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Radio, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { loginUser, clearError } from '../store/slices/authSlice.js';
import socketService from '../services/socket.js';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, actionLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket upon login
      socketService.connect();
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      socketService.connect();
      navigate('/dashboard');
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090D16] p-4 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
            <Radio className="h-7 w-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Fleet<span className="text-indigo-400">Pulse</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
            Real-Time Telemetry & Operations Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In to FleetPulse</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authenticate to access live telemetry stream and telemetry ops
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fleetpulse.com"
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white tracking-wide shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Assessment Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@fleetpulse.com', 'Admin@123')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="text-xs font-bold text-indigo-400 block font-mono">Demo Admin</span>
                <span className="text-[10px] text-slate-400 font-mono block">admin@fleetpulse.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('dispatcher@fleetpulse.com', 'Dispatcher@123')}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="text-xs font-bold text-sky-400 block font-mono">Dispatcher</span>
                <span className="text-[10px] text-slate-400 font-mono block">dispatcher@fleetpulse.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 font-mono">
          FleetPulse Telemetry System • Secure JWT Session Management
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
