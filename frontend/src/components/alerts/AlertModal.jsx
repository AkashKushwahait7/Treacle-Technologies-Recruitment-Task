import React from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Clock, Gauge, ShieldAlert } from 'lucide-react';
import AlertBadge from '../common/AlertBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { resolveAlertThunk } from '../../store/slices/alertsSlice.js';

export const AlertModal = ({ isOpen, alert, onClose }) => {
  const dispatch = useDispatch();

  if (!isOpen || !alert) return null;

  const handleResolve = async () => {
    await dispatch(resolveAlertThunk(alert._id));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-mono">
                    {alert.vehicleId}
                  </h3>
                  <AlertBadge severity={alert.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Threshold Breach Incident</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details Body */}
          <div className="py-5 space-y-4">
            {/* Description Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                Incident Message
              </p>
              <p className="text-sm font-medium text-white">{alert.message}</p>
            </div>

            {/* Metric Comparison Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Measured Value
                </span>
                <span className="font-mono text-xl font-bold text-rose-400 mt-1 block">
                  {alert.value}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  Threshold Limit
                </span>
                <span className="font-mono text-xl font-bold text-slate-300 mt-1 block">
                  {alert.threshold}
                </span>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Incident Type:</span>
                <span className="text-slate-200 font-semibold">{alert.type}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Current Status:</span>
                <AlertBadge status={alert.status} size="sm" />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
                <span className="text-slate-400">Triggered At:</span>
                <span className="text-slate-300">{formatDate(alert.timestamp)}</span>
              </div>
              {alert.resolvedAt && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 font-mono">
                  <span className="text-slate-400">Resolved At:</span>
                  <span className="text-emerald-400">{formatDate(alert.resolvedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
            {alert.status === 'ACTIVE' && (
              <button
                onClick={handleResolve}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Mark as Resolved</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal;
