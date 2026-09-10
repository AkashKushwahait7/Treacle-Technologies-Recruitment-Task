import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Bell, Pause, Play, Clock } from 'lucide-react';
import LiveIndicator from '../common/LiveIndicator.jsx';
import { formatTime } from '../../utils/formatters.js';
import { togglePauseLive } from '../../store/slices/dashboardSlice.js';

export const Topbar = ({ onOpenMobile }) => {
  const dispatch = useDispatch();
  const socketStatus = useSelector((state) => state.dashboard.socketStatus);
  const isPaused = useSelector((state) => state.dashboard.isPaused);
  const lastLiveTimestamp = useSelector((state) => state.dashboard.lastLiveTimestamp);
  const activeAlertsCount = useSelector((state) => state.alerts.stats.active);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#090D16]/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-200">Fleet Operations</span>
          <span>/</span>
          <span className="font-mono text-indigo-400 font-semibold">Real-Time Ingestion</span>
        </div>
      </div>

      {/* Right: Live indicator, pause toggle, timestamp, notifications */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Real-time Status Badge */}
        <LiveIndicator status={socketStatus} isPaused={isPaused} />

        {/* Live Received Timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400">Stream:</span>
          <span className="text-white font-semibold">
            {formatTime(lastLiveTimestamp)}
          </span>
        </div>

        {/* Pause / Resume Button */}
        <button
          onClick={() => dispatch(togglePauseLive())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
            isPaused
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title={isPaused ? 'Resume live telemetry ingestion' : 'Pause live stream processing'}
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5 fill-emerald-400" />
              <span>Resume Live</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Live</span>
            </>
          )}
        </button>

        {/* Notifications Icon with active alerts badge */}
        <div className="relative">
          <button
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={`${activeAlertsCount} active alerts`}
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono animate-pulse">
                {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
