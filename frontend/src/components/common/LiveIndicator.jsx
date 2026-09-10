import React from 'react';
import { Wifi, WifiOff, RefreshCw, Pause } from 'lucide-react';

export const LiveIndicator = ({ status = 'disconnected', isPaused = false }) => {
  const currentStatus = isPaused ? 'paused' : status;

  const configs = {
    connected: {
      color: 'bg-emerald-500',
      text: 'LIVE',
      textColor: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/40',
      icon: Wifi,
      animate: true,
    },
    reconnecting: {
      color: 'bg-amber-500',
      text: 'Reconnecting',
      textColor: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/40',
      icon: RefreshCw,
      animate: true,
    },
    paused: {
      color: 'bg-sky-500',
      text: 'PAUSED',
      textColor: 'text-sky-400',
      border: 'border-sky-500/30',
      bg: 'bg-sky-950/40',
      icon: Pause,
      animate: false,
    },
    disconnected: {
      color: 'bg-rose-500',
      text: 'Disconnected',
      textColor: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/40',
      icon: WifiOff,
      animate: false,
    },
  };

  const config = configs[currentStatus] || configs.disconnected;
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${config.bg} ${config.border} ${config.textColor}`}
      title={`Stream status: ${config.text}`}
    >
      <span className="relative flex h-2 w-2">
        {config.animate && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
          ></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`}></span>
      </span>
      <span className="font-mono font-bold uppercase">{config.text}</span>
    </div>
  );
};

export default LiveIndicator;
