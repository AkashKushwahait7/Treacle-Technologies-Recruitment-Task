import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSummary } from '../store/slices/dashboardSlice.js';
import { fetchAlerts } from '../store/slices/alertsSlice.js';
import { fetchVehicles } from '../store/slices/vehiclesSlice.js';
import MetricGrid from '../components/dashboard/MetricGrid.jsx';
import RealtimeChart from '../components/dashboard/RealtimeChart.jsx';
import EventFeed from '../components/dashboard/EventFeed.jsx';
import FleetHealthGauge from '../components/dashboard/FleetHealthGauge.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { formatTime } from '../utils/formatters.js';
import { RefreshCw, Radio, Truck, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { summary, summaryLoading, lastPollingTimestamp, isPaused, socketStatus } = useSelector(
    (state) => state.dashboard
  );
  const pollingInterval = useSelector((state) => state.settings.pollingInterval || 10000);

  // Initial load and periodic polling for aggregated summary
  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchAlerts({ limit: 5 }));
    dispatch(fetchVehicles({ limit: 20 }));

    // Periodic Polling
    const interval = setInterval(() => {
      dispatch(fetchSummary());
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [dispatch, pollingInterval]);

  return (
    <div className="space-y-6">
      {/* Page Header with Polling status & Quick stats */}
      <PageHeader
        title="Fleet Telemetry Overview"
        subtitle="Real-time vehicle telemetry ingestion and composite fleet telemetry monitoring"
      >
        <div className="flex items-center gap-3">
          {/* Polling Timestamp indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <RefreshCw className={`h-3 w-3 ${summaryLoading ? 'animate-spin text-indigo-400' : 'text-slate-500'}`} />
            <span>Aggregated API:</span>
            <span className="text-slate-200 font-semibold">
              {formatTime(lastPollingTimestamp)}
            </span>
          </div>

          <button
            onClick={() => dispatch(fetchSummary())}
            disabled={summaryLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Aggregated Summary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${summaryLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </PageHeader>

      {/* 1. Live Numeric Metrics Cards */}
      <MetricGrid />

      {/* 2. Realtime Chart & Health Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RealtimeChart />
        </div>
        <div>
          <FleetHealthGauge
            health={summary?.fleetHealth ?? 88}
            activeVehicles={summary?.activeVehicles ?? 16}
            totalVehicles={summary?.totalVehicles ?? 18}
          />
        </div>
      </div>

      {/* 3. Live Event Feed & Fleet Status Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <EventFeed />
        </div>

        {/* Fleet KPI Quick Summary Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-400" />
                <span>Active Fleet Summary</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Total: {summary?.totalVehicles || 18}
              </span>
            </div>

            <div className="space-y-3.5 mt-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Total Distance Covered:</span>
                <span className="font-bold text-white">
                  {summary?.totalDistance ? Number(summary.totalDistance).toLocaleString() : '841,760'} km
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Active Moving Vehicles:</span>
                <span className="font-bold text-emerald-400">
                  {summary?.activeVehicles || 16} units
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Critical Open Incidents:</span>
                <span className={`font-bold ${(summary?.activeAlerts || 0) > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {summary?.activeAlerts || 0} active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Simulation Tick Interval:</span>
                <span className="font-bold text-indigo-400">2000 ms</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>WebSocket Status:</span>
            <span className="text-emerald-400 font-semibold uppercase">{socketStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
