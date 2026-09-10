import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, badge, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  };

  return (
    <div className="rounded-xl bg-[#0F172A]/90 p-5 border border-slate-800 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {badge && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-2xl md:text-3xl font-bold text-white">
          {value}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
