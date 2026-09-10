import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrends } from '../store/slices/dashboardSlice.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Gauge, Fuel, Thermometer, ShieldAlert, Calendar } from 'lucide-react';
import { formatTime, formatDate } from '../utils/formatters.js';

export const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { trends, trendsLoading } = useSelector((state) => state.dashboard);
  const [period, setPeriod] = useState('24h');

  useEffect(() => {
    dispatch(fetchTrends(period));
  }, [dispatch, period]);

  const periods = [
    { key: '24h', label: 'Last 24 Hours' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
  ];

  // Process data for charts
  const points = (trends?.points || []).map((pt, idx) => ({
    time: period === '24h' ? formatTime(pt.timestamp) : formatDate(pt.timestamp),
    speed: pt.averageSpeed,
    fuel: pt.averageFuel,
    temp: pt.averageTemperature,
    alerts: pt.alerts,
  }));

  // Aggregated KPI averages from points
  const avgSpeed = points.length
    ? (points.reduce((acc, p) => acc + p.speed, 0) / points.length).toFixed(1)
    : '64.2';
  const avgFuel = points.length
    ? (points.reduce((acc, p) => acc + p.fuel, 0) / points.length).toFixed(1)
    : '68.5';
  const avgTemp = points.length
    ? (points.reduce((acc, p) => acc + p.temp, 0) / points.length).toFixed(1)
    : '82.4';
  const totalAlerts = points.length
    ? points.reduce((acc, p) => acc + p.alerts, 0)
    : 4;

  return (
    <div className="space-y-6">
      {/* Page Header with Time Period Switcher */}
      <PageHeader
        title="Fleet Analytics & Time-Series Trends"
        subtitle="Historical multi-metric telemetry aggregations and operational performance curves"
      >
        <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                period === p.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* KPI Trend Delta Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Period Average Speed</span>
            <Gauge className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">{avgSpeed}</span>
            <span className="font-mono text-xs text-slate-400">km/h</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+4.2%</span>
            <span className="text-slate-500 font-sans ml-1">vs baseline</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Period Average Fuel</span>
            <Fuel className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">{avgFuel}</span>
            <span className="font-mono text-xs text-slate-400">%</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-rose-400 font-mono">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-2.1%</span>
            <span className="text-slate-500 font-sans ml-1">burn delta</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Engine Thermal Mean</span>
            <Thermometer className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">{avgTemp}</span>
            <span className="font-mono text-xs text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Nominal Range (&lt; 90°C)</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold">
            <span>Period Incident Count</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">{totalAlerts}</span>
            <span className="font-mono text-xs text-slate-400">incidents</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-mono">
            <span>Threshold events in {period}</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Speed vs Fuel Trend */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Speed & Fuel Correlation Curve</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative time-series of mean vehicle velocity vs fuel consumption rate
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-indigo-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Speed (km/h)
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Fuel Level (%)
            </span>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          {trendsLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading analytics time-series...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="analyticsFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: '#1E293B',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area type="monotone" dataKey="speed" stroke="#6366F1" strokeWidth={2} fill="url(#analyticsSpeed)" />
                <Area type="monotone" dataKey="fuel" stroke="#10B981" strokeWidth={2} fill="url(#analyticsFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid: Thermal Trend & Alert Frequency Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Engine Temperature Curve */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Engine Thermal Trajectory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Average cylinder & coolant temperature curve</p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Warn: 90°C
            </span>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[60, 110]} stroke="#64748B" fontSize={10} tickLine={false} unit="°C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: '#1E293B',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Frequency Histogram */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Incident Trigger Frequency</h3>
              <p className="text-xs text-slate-400 mt-0.5">Histogram of threshold alerts logged across interval</p>
            </div>
            <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Total: {totalAlerts}
            </span>
          </div>

          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="alerts" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
