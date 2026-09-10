import React from 'react';
import { ALERT_SEVERITY, ALERT_STATUS, VEHICLE_STATUS } from '../../utils/constants.js';

export const AlertBadge = ({ severity, status, vehicleStatus, size = 'md' }) => {
  let config = null;

  if (severity) {
    config = ALERT_SEVERITY[severity.toUpperCase()] || ALERT_SEVERITY.INFO;
  } else if (status) {
    config = ALERT_STATUS[status.toUpperCase()] || ALERT_STATUS.ACTIVE;
  } else if (vehicleStatus) {
    config = VEHICLE_STATUS[vehicleStatus.toUpperCase()] || VEHICLE_STATUS.OK;
  }

  if (!config) return null;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.badge} ${sizeClasses}`}
    >
      {config.dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      <span className="font-semibold uppercase tracking-wider">{config.label}</span>
    </span>
  );
};

export default AlertBadge;
