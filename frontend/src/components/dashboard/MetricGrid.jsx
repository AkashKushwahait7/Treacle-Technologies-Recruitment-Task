import React from 'react';
import { useSelector } from 'react-redux';
import MetricCard from '../common/MetricCard.jsx';
import { Gauge, Fuel, Thermometer, ShieldCheck, Truck, AlertOctagon } from 'lucide-react';

export const MetricGrid = () => {
  const liveMetrics = useSelector((state) => state.dashboard.liveMetrics);
  const summary = useSelector((state) => state.dashboard.summary);

  const speedTrend = summary?.trend?.speed ? { value: summary.trend.speed } : null;
  const fuelTrend = summary?.trend?.fuel ? { value: summary.trend.fuel } : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Average Speed */}
      <MetricCard
        title="Current Average Speed"
        value={liveMetrics.averageSpeed}
        unit="km/h"
        icon={Gauge}
        trend={speedTrend}
        status={liveMetrics.averageSpeed > 90 ? 'warning' : 'normal'}
        subtitle="Calculated over live active vehicles"
      />

      {/* 2. Average Fuel Level */}
      <MetricCard
        title="Average Fuel Level"
        value={liveMetrics.averageFuelLevel}
        unit="%"
        icon={Fuel}
        trend={fuelTrend}
        status={liveMetrics.averageFuelLevel < 25 ? 'warning' : 'optimal'}
        subtitle="Fleet-wide reservoir status"
      />

      {/* 3. Engine Temperature */}
      <MetricCard
        title="Engine Temperature"
        value={liveMetrics.engineTemperature}
        unit="°C"
        icon={Thermometer}
        status={liveMetrics.engineTemperature >= 90 ? 'critical' : 'normal'}
        subtitle={
          liveMetrics.engineTemperature >= 90
            ? 'Thermal warning threshold exceeded'
            : 'Within nominal thermal envelope'
        }
      />

      {/* 4. Fleet Health Index */}
      <MetricCard
        title="Fleet Health Score"
        value={liveMetrics.fleetHealth}
        unit="/ 100"
        icon={ShieldCheck}
        status={liveMetrics.fleetHealth > 80 ? 'optimal' : liveMetrics.fleetHealth > 60 ? 'warning' : 'critical'}
        subtitle={`${liveMetrics.activeVehicles} active • ${liveMetrics.criticalAlerts} critical`}
      />
    </div>
  );
};

export default MetricGrid;
