import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { setSelectedMetric } from '../../store/slices/dashboardSlice.js';
import { Gauge, Fuel, Thermometer, BatteryCharging } from 'lucide-react';

const metricConfigs = {
  speed: {
    label: 'Speed',
    unit: 'km/h',
    color: '#6366F1', // Indigo
    gradientId: 'speedGrad',
    icon: Gauge,
    min: 0,
    max: 130,
  },
  fuel: {
    label: 'Fuel Level',
    unit: '%',
    color: '#10B981', // Emerald
    gradientId: 'fuelGrad',
    icon: Fuel,
    min: 0,
    max: 100,
  },
  temp: {
    label: 'Engine Temp',
    unit: '°C',
    color: '#F59E0B', // Amber
    gradientId: 'tempGrad',
    icon: Thermometer,
    min: 50,
    max: 120,
  },
  battery: {
    label: 'Battery Level',
    unit: '%',
    color: '#38BDF8', // Sky
    gradientId: 'batteryGrad',
    icon: BatteryCharging,
    min: 0,
    max: 100,
  },
};

const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-800 bg-[#0B0F17]/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <p className="text-slate-400 font-sans mb-1 font-semibold flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-indigo-400 font-mono">{data.vehicleId || 'FLEET'}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-slate-300">Metric Value:</span>
          <span className="font-bold text-white text-sm">
            {payload[0].value} {unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const RealtimeChart = () => {
  const dispatch = useDispatch();
  const trailingPoints = useSelector((state) => state.dashboard.trailingPoints);
  const selectedMetric = useSelector((state) => state.dashboard.selectedMetric);

  const activeConfig = metricConfigs[selectedMetric] || metricConfigs.speed;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm backdrop-blur-md">
      {/* Header & Interactive Control Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <span>Live Stream Telemetry Graph</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">
              Trailing {trailingPoints.length} Points
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous real-time stream dynamically plotted via WebSockets
          </p>
        </div>

        {/* Interactive Metric Switcher */}
        <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          {Object.entries(metricConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => dispatch(setSelectedMetric(key))}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-4 h-72 w-full">
        {trailingPoints.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center rounded-lg border border-dashed border-slate-800 text-slate-500 font-mono text-xs">
            Connecting to real-time telemetry stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trailingPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />
              <YAxis
                domain={[activeConfig.min, activeConfig.max]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                unit={activeConfig.unit === '°C' ? '°' : activeConfig.unit === '%' ? '%' : ''}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    unit={activeConfig.unit}
                    color={activeConfig.color}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGrad)"
                isAnimationActive={false} // Disabled for smooth continuous streaming without flicker
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RealtimeChart;
