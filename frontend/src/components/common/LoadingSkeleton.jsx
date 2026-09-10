import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse p-5"
          >
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="mt-4 h-8 w-32 bg-slate-800 rounded"></div>
            <div className="mt-4 h-3 w-40 bg-slate-800/60 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/80 p-5 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="space-y-3">
          {items.map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="h-80 rounded-xl bg-[#0F172A]/80 border border-slate-800 animate-pulse p-6">
        <div className="h-5 w-40 bg-slate-800 rounded mb-6"></div>
        <div className="h-56 bg-slate-800/30 rounded flex items-center justify-center text-slate-600 text-sm font-mono">
          Loading telemetry stream...
        </div>
      </div>
    );
  }

  return (
    <div className="h-24 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse" />
  );
};

export default LoadingSkeleton;
