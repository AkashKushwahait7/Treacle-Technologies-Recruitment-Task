import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import AlertBadge from '../common/AlertBadge.jsx';

export const EventFeed = () => {
  const liveEventFeed = useSelector((state) => state.dashboard.liveEventFeed);

  const getEventIcon = (eventType, status) => {
    if (eventType === 'ALERT' || status === 'CRITICAL' || status === 'WARN') {
      return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
    }
    if (eventType === 'RECOVERY') {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
    return <Radio className="h-4 w-4 text-indigo-400 shrink-0" />;
  };

  const getEventBadge = (eventType) => {
    if (eventType === 'ALERT') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
          ALERT
        </span>
      );
    }
    if (eventType === 'RECOVERY') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          RECOVERY
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
        UPDATE
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm backdrop-blur-md flex flex-col h-[430px]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>Live Telemetry Event Feed</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming status transitions and threshold events
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 font-medium">
          {liveEventFeed.length} Events
        </span>
      </div>

      {/* Scrollable Events List */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5">
        {liveEventFeed.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
            Awaiting live telemetry events...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {liveEventFeed.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -15, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">{getEventIcon(event.eventType, event.status)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white tracking-wide">
                        {event.vehicleId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5 text-[11px] truncate">
                      {event.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                      <span>Speed: {event.speed} km/h</span>
                      <span>•</span>
                      <span>Temp: {event.temp}°C</span>
                      <span>•</span>
                      <span>Fuel: {event.fuel}%</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {getEventBadge(event.eventType)}
                  <AlertBadge vehicleStatus={event.status} size="sm" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default EventFeed;
