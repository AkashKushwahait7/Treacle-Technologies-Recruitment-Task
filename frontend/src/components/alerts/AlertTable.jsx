import React from 'react';
import { useDispatch } from 'react-redux';
import { Eye, CheckCircle, Clock } from 'lucide-react';
import AlertBadge from '../common/AlertBadge.jsx';
import { formatTime, formatDate } from '../../utils/formatters.js';
import { openAlertModal, resolveAlertThunk } from '../../store/slices/alertsSlice.js';

export const AlertTable = ({ alerts = [], onSelectAlert }) => {
  const dispatch = useDispatch();

  const handleResolve = (e, alertId) => {
    e.stopPropagation();
    dispatch(resolveAlertThunk(alertId));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#0B0F17] text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3">Vehicle</th>
            <th scope="col" className="px-4 py-3">Severity</th>
            <th scope="col" className="px-4 py-3">Alert Description</th>
            <th scope="col" className="px-4 py-3">Value / Threshold</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Timestamp</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-[#0F172A]/50">
          {alerts.map((alert) => (
            <tr
              key={alert._id}
              onClick={() => onSelectAlert(alert)}
              className="hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              {/* Vehicle ID */}
              <td className="px-4 py-3.5 font-mono font-bold text-white whitespace-nowrap">
                {alert.vehicleId}
              </td>

              {/* Severity Badge */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <AlertBadge severity={alert.severity} size="sm" />
              </td>

              {/* Message */}
              <td className="px-4 py-3.5 max-w-xs truncate text-slate-200">
                {alert.message}
              </td>

              {/* Metric Value vs Threshold */}
              <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                <span className="text-white font-semibold">{alert.value}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{alert.threshold}</span>
              </td>

              {/* Status */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <AlertBadge status={alert.status} size="sm" />
              </td>

              {/* Time */}
              <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                {formatDate(alert.timestamp)}
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Inspect Alert Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={(e) => handleResolve(e, alert._id)}
                      className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertTable;
