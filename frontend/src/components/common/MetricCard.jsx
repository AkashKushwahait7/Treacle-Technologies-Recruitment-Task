import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  trend = null, // e.g. { value: 4.2, isPositive: true }
  status = 'normal', // 'normal' | 'optimal' | 'warning' | 'critical'
  icon: Icon,
  subtitle,
  className = '',
}) => {
  const statusStyles = {
    optimal: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400',
    warning: 'border-amber-500/30 hover:border-amber-500/50 text-amber-400',
    critical: 'border-rose-500/30 hover:border-rose-500/50 text-rose-400',
    normal: 'border-slate-800 hover:border-slate-700 text-indigo-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#0F172A]/90 p-5 border backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-md ${statusStyles[status] || statusStyles.normal} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <motion.span
              key={value}
              initial={{ opacity: 0.7, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-white"
            >
              {value}
            </motion.span>
            {unit && (
              <span className="font-mono text-sm font-medium text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        {trend ? (
          <div className="flex items-center gap-1">
            {trend.value > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            ) : trend.value < 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span
              className={`font-mono font-semibold ${
                trend.value > 0
                  ? 'text-emerald-400'
                  : trend.value < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
            <span className="text-slate-500 ml-1">vs prev window</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-400">{subtitle}</span>
        ) : (
          <span className="text-slate-500 font-mono">Live Telemetry Ingestion</span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
