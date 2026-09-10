import React from 'react';
import { MapPin, Gauge, Fuel, Thermometer, BatteryCharging, Radio } from 'lucide-react';
import AlertBadge from '../common/AlertBadge.jsx';
import { formatSpeed, formatPercentage, formatTemperature, formatTime, formatDistance } from '../../utils/formatters.js';

export const VehicleCard = ({ vehicle, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(vehicle)}
      className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm hover:border-slate-700 hover:bg-[#131D33] cursor-pointer transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white tracking-wide">
                {vehicle.vehicleId}
              </span>
              <AlertBadge vehicleStatus={vehicle.status} size="sm" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {vehicle.registrationNumber} • {vehicle.vehicleType}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-800/80 text-indigo-400 border border-slate-700/60">
            <Radio className="h-4 w-4" />
          </div>
        </div>

        {/* Driver & Location */}
        <div className="mt-3 space-y-1 text-xs">
          <p className="text-slate-200 font-medium">{vehicle.driverName}</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
            <span className="truncate">{vehicle.location?.city || 'Delhi'} ({vehicle.location?.address || 'NH Corridor'})</span>
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 font-mono text-center">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Speed</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {formatSpeed(vehicle.currentSpeed)}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Fuel</span>
            <span
              className={`text-xs font-bold block mt-0.5 ${
                vehicle.fuelLevel <= 25 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {formatPercentage(vehicle.fuelLevel)}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Temp</span>
            <span
              className={`text-xs font-bold block mt-0.5 ${
                vehicle.engineTemperature >= 90 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {formatTemperature(vehicle.engineTemperature)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Dist: {formatDistance(vehicle.totalDistance)}</span>
        <span>Ping: {formatTime(vehicle.lastTelemetryAt)}</span>
      </div>
    </div>
  );
};

export default VehicleCard;
