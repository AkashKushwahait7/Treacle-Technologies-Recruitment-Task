import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/common/PageHeader.jsx';
import {
  setPollingInterval,
  toggleLiveUpdates,
  toggleNotifications,
  updateThresholds,
  resetSettings,
} from '../store/slices/settingsSlice.js';
import { addToast } from '../store/slices/toastSlice.js';
import { Sliders, RefreshCw, Radio, Bell, Shield, RotateCcw, Check } from 'lucide-react';

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const {
    pollingInterval,
    isLiveUpdatesEnabled,
    notificationsEnabled,
    thresholds,
  } = useSelector((state) => state.settings);

  const [tempWarn, setTempWarn] = useState(thresholds.temperatureWarning);
  const [tempCrit, setTempCrit] = useState(thresholds.temperatureCritical);
  const [fuelWarn, setFuelWarn] = useState(thresholds.fuelWarning);
  const [battWarn, setBattWarn] = useState(thresholds.batteryWarning);

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    dispatch(
      updateThresholds({
        temperatureWarning: Number(tempWarn),
        temperatureCritical: Number(tempCrit),
        fuelWarning: Number(fuelWarn),
        batteryWarning: Number(battWarn),
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Telemetry thresholds and polling rates updated successfully.',
      })
    );
  };

  const handleReset = () => {
    dispatch(resetSettings());
    setTempWarn(90);
    setTempCrit(100);
    setFuelWarn(25);
    setBattWarn(30);
    dispatch(
      addToast({
        type: 'info',
        title: 'Settings Reset',
        message: 'Restored default fleet operational thresholds.',
      })
    );
  };

  const intervals = [
    { value: 5000, label: '5 Seconds' },
    { value: 10000, label: '10 Seconds (Default)' },
    { value: 15000, label: '15 Seconds' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Fleet System Settings & Configurations"
        subtitle="Configure real-time polling cadence, threshold triggers, and UI preferences"
      />

      {/* 1. Real-Time Telemetry & Data Refresh Rates */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-indigo-600/15 text-indigo-400 border border-indigo-500/20">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Aggregated API Polling Cadence</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Frequency of periodic background calls to /api/dashboard/summary and /trends
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-2 font-mono">
              Polling Interval:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {intervals.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    dispatch(setPollingInterval(item.value));
                    dispatch(
                      addToast({
                        type: 'info',
                        title: 'Cadence Updated',
                        message: `Polling frequency adjusted to ${item.label}.`,
                      })
                    );
                  }}
                  className={`p-3 rounded-lg border text-xs font-mono font-semibold transition-all text-left ${
                    pollingInterval === item.value
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {pollingInterval === item.value && <Check className="h-4 w-4 text-indigo-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Continuous WebSocket Stream
              </span>
              <span className="text-[11px] text-slate-400">
                Receive live 2000ms telemetry broadcasts from backend
              </span>
            </div>
            <button
              onClick={() => dispatch(toggleLiveUpdates())}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isLiveUpdatesEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  isLiveUpdatesEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Centralized Alert Threshold Settings */}
      <form onSubmit={handleSaveThresholds} className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Centralized Incident Thresholds</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize threshold evaluation boundaries for engine thermal, fuel, and battery warnings
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Temperature Warning */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Engine Temperature Warning (°C)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Triggers WARNING incident state</p>
            <input
              type="number"
              value={tempWarn}
              onChange={(e) => setTempWarn(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-slate-800 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Temperature Critical */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Engine Temperature Critical (°C)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Triggers CRITICAL incident state</p>
            <input
              type="number"
              value={tempCrit}
              onChange={(e) => setTempCrit(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-slate-800 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Fuel Warning */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Low Fuel Warning Threshold (%)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Triggers low fuel warning below this percentage</p>
            <input
              type="number"
              value={fuelWarn}
              onChange={(e) => setFuelWarn(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-slate-800 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Battery Warning */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Low Battery Warning Threshold (%)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">Triggers auxiliary/EV battery warning</p>
            <input
              type="number"
              value={battWarn}
              onChange={(e) => setBattWarn(e.target.value)}
              className="w-full rounded bg-[#0B0F17] border border-slate-800 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* 3. Notification Preferences */}
      <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Alert Notifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Display live toast notifications when new threshold incidents arrive
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              In-App Incident Toasts
            </span>
            <span className="text-[11px] text-slate-400">
              Emit toasts on critical overspeeding, low fuel, and thermal spikes
            </span>
          </div>
          <button
            onClick={() => dispatch(toggleNotifications())}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
