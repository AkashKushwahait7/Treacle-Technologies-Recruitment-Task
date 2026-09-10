import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  BarChart3,
  Truck,
  AlertTriangle,
  Settings,
  User,
  LogOut,
  Radio,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice.js';
import socketService from '../../services/socket.js';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Fleet Vehicles', path: '/vehicles', icon: Truck },
  { name: 'Alerts Center', path: '/alerts', icon: AlertTriangle },
  { name: 'System Settings', path: '/settings', icon: Settings },
  { name: 'User Profile', path: '/profile', icon: User },
];

export const Sidebar = ({ onCloseMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const activeAlertsCount = useSelector((state) => state.alerts.stats.active);

  const handleLogout = async () => {
    socketService.disconnect();
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full bg-[#0B0F17] border-r border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
          <Radio className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            Fleet<span className="text-indigo-400">Pulse</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block -mt-0.5">
            Telemetry Ops
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              {item.name === 'Alerts Center' && activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {activeAlertsCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Quick Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080C14]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 uppercase truncate">
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
