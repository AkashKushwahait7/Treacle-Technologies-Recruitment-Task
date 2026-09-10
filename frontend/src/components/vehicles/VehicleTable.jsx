import React from 'react';
import { Eye, MapPin, Gauge, Fuel, Thermometer } from 'lucide-react';
import AlertBadge from '../common/AlertBadge.jsx';
import { formatSpeed, formatPercentage, formatTemperature, formatTime } from '../../utils/formatters.js';

export const VehicleTable = ({ vehicles = [], onSelectVehicle }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#0B0F17] text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3">Vehicle</th>
            <th scope="col" className="px-4 py-3">Driver & Type</th>
            <th scope="col" className="px-4 py-3">Location</th>
            <th scope="col" className="px-4 py-3">Speed</th>
            <th scope="col" className="px-4 py-3">Fuel</th>
            <th scope="col" className="px-4 py-3">Temp</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Last Ping</th>
            <th scope="col" className="px-4 py-3 text-right">Inspect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-[#0F172A]/50">
          {vehicles.map((v) => (
            <tr
              key={v.vehicleId}
              onClick={() => onSelectVehicle(v)}
              className="hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              {/* Vehicle ID & Plate */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="font-mono font-bold text-white text-sm">
                  {v.vehicleId}
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  {v.registrationNumber}
                </div>
              </td>

              {/* Driver & Type */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="font-semibold text-slate-200">{v.driverName}</div>
                <div className="text-[11px] text-slate-400">{v.vehicleType}</div>
              </td>

              {/* Location */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span>{v.location?.city || 'Delhi'}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {v.location?.address || 'Corridor Hub'}
                </div>
              </td>

              {/* Speed */}
              <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                <span className="font-bold text-white">{formatSpeed(v.currentSpeed)}</span>
              </td>

              {/* Fuel Level */}
              <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                <span
                  className={`font-semibold ${
                    v.fuelLevel <= 10
                      ? 'text-rose-400'
                      : v.fuelLevel <= 25
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {formatPercentage(v.fuelLevel)}
                </span>
              </td>

              {/* Engine Temp */}
              <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                <span
                  className={`font-semibold ${
                    v.engineTemperature >= 100
                      ? 'text-rose-400'
                      : v.engineTemperature >= 90
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {formatTemperature(v.engineTemperature)}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <AlertBadge vehicleStatus={v.status} size="sm" />
              </td>

              {/* Last Ping */}
              <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                {formatTime(v.lastTelemetryAt)}
              </td>

              {/* Inspect Button */}
              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                <button
                  onClick={() => onSelectVehicle(v)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Inspect Telemetry & Route"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;
