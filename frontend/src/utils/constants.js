export const APP_NAME = 'FleetPulse';

export const VEHICLE_STATUS = {
  OK: {
    label: 'Optimal',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  WARN: {
    label: 'Warning',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
};

export const ALERT_SEVERITY = {
  INFO: {
    label: 'Info',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-500',
  },
  WARNING: {
    label: 'Warning',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
};

export const ALERT_STATUS = {
  ACTIVE: {
    label: 'Active',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  RESOLVED: {
    label: 'Resolved',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
};

export const DEFAULT_THRESHOLDS = {
  TEMPERATURE_WARNING: 90,
  TEMPERATURE_CRITICAL: 100,
  FUEL_WARNING: 25,
  FUEL_CRITICAL: 10,
  BATTERY_WARNING: 30,
  BATTERY_CRITICAL: 15,
  SPEED_WARNING: 100,
  SPEED_CRITICAL: 120,
};
