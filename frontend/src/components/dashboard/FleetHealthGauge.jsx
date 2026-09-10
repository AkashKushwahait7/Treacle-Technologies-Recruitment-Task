import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export const FleetHealthGauge = ({ health = 88, activeVehicles = 16, totalVehicles = 18 }) => {
  const getHealthMeta = (score) => {
    if (score >= 80) {
      return {
        label: 'Optimal Health',
        color: 'text-emerald-400',
        stroke: '#10B981',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        icon: ShieldCheck,
      };
    }
    if (score >= 60) {
      return {
        label: 'Moderate Risk',
        color: 'text-amber-400',
        stroke: '#F59E0B',
        bg: 'bg-amber-500/10 border-amber-500/20',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Degraded State',
      color: 'text-rose-400',
      stroke: '#EF4444',
      bg: 'bg-rose-500/10 border-rose-500/20',
      icon: AlertCircle,
    };
  };

  const meta = getHealthMeta(health);
  const Icon = meta.icon;

  // Circular gauge parameters
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white">Fleet Health Score</h3>
          <p className="text-xs text-slate-400 mt-0.5">Composite telemetry health index</p>
        </div>
        <div className={`p-2 rounded-lg border ${meta.bg}`}>
          <Icon className={`h-4 w-4 ${meta.color}`} />
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="#1E293B"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke={meta.stroke}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-bold text-white tracking-tight">
              {health}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Operating Status:</span>
        <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
      </div>
    </div>
  );
};

export default FleetHealthGauge;
