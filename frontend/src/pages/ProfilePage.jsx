import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import { logoutUser } from '../store/slices/authSlice.js';
import socketService from '../services/socket.js';
import { formatDate } from '../utils/formatters.js';
import { User, Shield, Key, LogOut, Clock, Radio, Activity } from 'lucide-react';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { socketStatus } = useSelector((state) => state.dashboard);

  const handleLogout = async () => {
    socketService.disconnect();
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Operator Profile & Active Session"
        subtitle="Manage authenticated operator credentials, role privileges, and telemetry session details"
      />

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-2xl border border-indigo-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{user?.name || 'Administrator'}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {user?.role || 'admin'}
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1">{user?.email || 'admin@fleetpulse.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Session</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs font-mono">
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span className="font-semibold uppercase text-slate-400">Security Role</span>
            </div>
            <p className="text-sm font-bold text-white capitalize">{user?.role || 'System Administrator'}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Full telemetry dispatch and resolution privileges</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Radio className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold uppercase text-slate-400">Stream Connection</span>
            </div>
            <p className="text-sm font-bold text-emerald-400 uppercase">{socketStatus}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">WebSocket real-time telemetry link active</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="font-semibold uppercase text-slate-400">Last Authentication</span>
            </div>
            <p className="text-sm font-bold text-white">{formatDate(user?.lastLogin || Date.now())}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Authenticated via HTTP-only JWT token</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Activity className="h-4 w-4 text-sky-400" />
              <span className="font-semibold uppercase text-slate-400">Account Created</span>
            </div>
            <p className="text-sm font-bold text-white">{formatDate(user?.createdAt || Date.now())}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Registered fleet management profile</span>
          </div>
        </div>
      </div>

      {/* Security & Access Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <Key className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-slate-300 block">Session Security & Cookie Isolation</span>
          FleetPulse uses secure HTTP-only cookies combined with Authorization headers. Sessions automatically expire after 24 hours.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
