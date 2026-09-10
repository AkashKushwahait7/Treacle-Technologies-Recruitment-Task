import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'No matching telemetry data or entities are available.',
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-[#0F172A]/40 border border-slate-800/80">
      <div className="h-12 w-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An error occurred while communicating with FleetPulse servers.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-rose-950/20 border border-rose-500/20 my-4">
      <div className="h-11 w-11 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-300">{title}</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
