import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Gauge, Fuel, Thermometer, BatteryCharging, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import AlertBadge from '../common/AlertBadge.jsx';
import { formatSpeed, formatPercentage, formatTemperature, formatDistance, formatTime, formatDate } from '../../utils/formatters.js';

export const VehicleDetailsModal = ({
  isOpen,
  vehicle,
  telemetry = [],
  alerts = [],
  onClose,
}) => {
  if (!isOpen || !vehicle) return null;

  // Chart data format
  const chartData = telemetry.map((pt) => ({
    time: formatTime(pt.timestamp),
    speed: pt.speed,
    temp: pt.engineTemperature,
    fuel: pt.fuelLevel,
  }));

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

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                    {vehicle.vehicleId}
                  </h2>
                  <AlertBadge vehicleStatus={vehicle.status} />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {vehicle.registrationNumber} • {vehicle.vehicleType} • Driver: {vehicle.driverName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Real-time telemetry snapshot 4-card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Speed</span>
                <Gauge className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-lg font-bold text-white">
                {formatSpeed(vehicle.currentSpeed)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Fuel</span>
                <Fuel className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span
                className={`text-lg font-bold ${
                  vehicle.fuelLevel <= 25 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {formatPercentage(vehicle.fuelLevel)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Temp</span>
                <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span
                className={`text-lg font-bold ${
                  vehicle.engineTemperature >= 90 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {formatTemperature(vehicle.engineTemperature)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Battery</span>
                <BatteryCharging className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <span className="text-lg font-bold text-sky-400">
                {formatPercentage(vehicle.batteryLevel)}
              </span>
            </div>
          </div>

          {/* Location & GPS Corridor Information */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span>Geographic Position & Corridor</span>
              </span>
              <span className="font-mono text-slate-400">
                Last Ping: {formatTime(vehicle.lastTelemetryAt)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-slate-300">
              <div>
                <span className="text-slate-500">City / State: </span>
                {vehicle.location?.city}, {vehicle.location?.state}
              </div>
              <div>
                <span className="text-slate-500">Coordinates: </span>
                {vehicle.location?.lat?.toFixed(4)}, {vehicle.location?.lng?.toFixed(4)}
              </div>
              <div>
                <span className="text-slate-500">Total Distance: </span>
                {formatDistance(vehicle.totalDistance)}
              </div>
            </div>
          </div>

          {/* Telemetry Trend Chart */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Recent Telemetry Time-Series
              </h4>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-indigo-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Speed (km/h)
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Temp (°C)
                </span>
              </div>
            </div>

            <div className="h-48 w-full mt-3">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                  No telemetry history points recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B0F17',
                        borderColor: '#1E293B',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Line type="monotone" dataKey="speed" stroke="#6366F1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Vehicle-Specific Alerts */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Incident History for {vehicle.vehicleId}</span>
            </h4>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">
                No active or recent alerts recorded for this vehicle.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {alerts.map((al) => (
                  <div
                    key={al._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertBadge severity={al.severity} size="sm" />
                      <span className="text-slate-200 truncate">{al.message}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatDate(al.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VehicleDetailsModal;
