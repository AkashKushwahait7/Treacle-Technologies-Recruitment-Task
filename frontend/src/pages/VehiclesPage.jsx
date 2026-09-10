import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVehicles,
  fetchVehicleDetails,
  setFilter,
  closeVehicleModal,
} from '../store/slices/vehiclesSlice.js';
import PageHeader from '../components/common/PageHeader.jsx';
import VehicleTable from '../components/vehicles/VehicleTable.jsx';
import VehicleCard from '../components/vehicles/VehicleCard.jsx';
import VehicleDetailsModal from '../components/vehicles/VehicleDetailsModal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import { Search, LayoutGrid, List, Truck, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const VehiclesPage = () => {
  const dispatch = useDispatch();
  const {
    vehicles,
    total,
    loading,
    selectedVehicle,
    selectedVehicleTelemetry,
    selectedVehicleAlerts,
    isModalOpen,
    filters,
  } = useSelector((state) => state.vehicles);

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  useEffect(() => {
    dispatch(fetchVehicles(filters));
  }, [dispatch, filters]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    dispatch(setFilter({ search: val }));
  };

  const handleStatusTab = (status) => {
    dispatch(setFilter({ status }));
  };

  const handleSelectVehicle = (vehicle) => {
    dispatch(fetchVehicleDetails(vehicle.vehicleId));
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Fleet Units' },
    { key: 'OK', label: 'Optimal (OK)' },
    { key: 'WARN', label: 'Warning State' },
    { key: 'CRITICAL', label: 'Critical Incident' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Vehicles & Asset Registry"
        subtitle="Manage active commercial fleet vehicles, live engine metrics, drivers, and geographical telemetry pings"
      />

      {/* Filter and View Switcher Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-4 shadow-sm backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 w-full md:w-auto overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                filters.status === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search ID, driver, city..."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vehicles Display */}
      {loading && vehicles.length === 0 ? (
        <LoadingSkeleton type={viewMode === 'table' ? 'table' : 'card'} count={8} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No Vehicles Matched"
          description="No fleet assets match your filter or search query."
        />
      ) : viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 shadow-sm overflow-hidden backdrop-blur-md">
          <VehicleTable vehicles={vehicles} onSelectVehicle={handleSelectVehicle} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <VehicleCard key={v.vehicleId} vehicle={v} onSelect={handleSelectVehicle} />
          ))}
        </div>
      )}

      {/* Vehicle Details & Real-Time Telemetry Modal */}
      <VehicleDetailsModal
        isOpen={isModalOpen}
        vehicle={selectedVehicle}
        telemetry={selectedVehicleTelemetry}
        alerts={selectedVehicleAlerts}
        onClose={() => dispatch(closeVehicleModal())}
      />
    </div>
  );
};

export default VehiclesPage;
