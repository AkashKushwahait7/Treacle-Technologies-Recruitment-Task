import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAlerts,
  setFilter,
  setPage,
  openAlertModal,
  closeAlertModal,
} from '../store/slices/alertsSlice.js';
import PageHeader from '../components/common/PageHeader.jsx';
import AlertTable from '../components/alerts/AlertTable.jsx';
import AlertModal from '../components/alerts/AlertModal.jsx';
import StatCard from '../components/common/StatCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import { Search, Filter, ShieldAlert, AlertTriangle, CheckCircle, Radio, ChevronLeft, ChevronRight } from 'lucide-react';

export const AlertsPage = () => {
  const dispatch = useDispatch();
  const {
    alerts,
    total,
    page,
    totalPages,
    loading,
    selectedAlert,
    isModalOpen,
    filters,
    stats,
  } = useSelector((state) => state.alerts);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  useEffect(() => {
    dispatch(fetchAlerts(filters));
  }, [dispatch, filters]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    dispatch(setFilter({ search: val }));
  };

  const handleSeverityChange = (e) => {
    dispatch(setFilter({ severity: e.target.value }));
  };

  const handleStatusChange = (e) => {
    dispatch(setFilter({ status: e.target.value }));
  };

  const handleSelectAlert = (alert) => {
    dispatch(openAlertModal(alert));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident & Alert Management Center"
        subtitle="Centralized fleet threshold breaches, automated recovery logs, and manual incident resolution"
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Critical Incidents"
          value={stats.critical}
          subtitle="Immediate operational risk"
          color="rose"
          icon={ShieldAlert}
        />
        <StatCard
          title="Warning Alerts"
          value={stats.warning}
          subtitle="Elevated telemetry readings"
          color="amber"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Breaches"
          value={stats.active}
          subtitle="Awaiting metric normalization"
          color="indigo"
          icon={Radio}
        />
        <StatCard
          title="Resolved Records"
          value={stats.resolved}
          subtitle="Normalized or acknowledged"
          color="emerald"
          icon={CheckCircle}
        />
      </div>

      {/* Search, Severity & Status Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-4 shadow-sm backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Vehicle ID, error message..."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors"
          />
        </div>

        {/* Filters Dropdown Group */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Severity Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Severity:</span>
            <select
              value={filters.severity || ''}
              onChange={handleSeverityChange}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={filters.status || ''}
              onChange={handleStatusChange}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Alerts Table Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 shadow-sm overflow-hidden backdrop-blur-md">
        {loading && alerts.length === 0 ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={6} />
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No Incidents or Alerts Found"
            description="All fleet vehicles are currently operating within defined threshold safety envelopes."
          />
        ) : (
          <>
            <AlertTable alerts={alerts} onSelectAlert={handleSelectAlert} />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0B0F17]/80 text-xs font-mono">
              <span className="text-slate-400">
                Showing <span className="text-white font-semibold">{alerts.length}</span> of{' '}
                <span className="text-white font-semibold">{total}</span> incidents
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => dispatch(setPage(page - 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-slate-300 px-2 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => dispatch(setPage(page + 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Alert Inspection Modal */}
      <AlertModal
        isOpen={isModalOpen}
        alert={selectedAlert}
        onClose={() => dispatch(closeAlertModal())}
      />
    </div>
  );
};

export default AlertsPage;
