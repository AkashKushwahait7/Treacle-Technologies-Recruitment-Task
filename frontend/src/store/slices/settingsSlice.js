import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_THRESHOLDS } from '../../utils/constants.js';

// Load persisted settings from localStorage if available
const loadPersistedSettings = () => {
  try {
    const raw = localStorage.getItem('fleetpulse_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load settings from localStorage', e);
  }
  return null;
};

const persisted = loadPersistedSettings();

const initialState = {
  theme: persisted?.theme || 'dark',
  pollingInterval: persisted?.pollingInterval || 10000, // 5000, 10000, 15000 ms
  isLiveUpdatesEnabled: persisted?.isLiveUpdatesEnabled ?? true,
  notificationsEnabled: persisted?.notificationsEnabled ?? true,
  thresholds: persisted?.thresholds || {
    temperatureWarning: DEFAULT_THRESHOLDS.TEMPERATURE_WARNING,
    temperatureCritical: DEFAULT_THRESHOLDS.TEMPERATURE_CRITICAL,
    fuelWarning: DEFAULT_THRESHOLDS.FUEL_WARNING,
    batteryWarning: DEFAULT_THRESHOLDS.BATTERY_WARNING,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      try {
        localStorage.setItem('fleetpulse_settings', JSON.stringify(state));
      } catch (e) {}
    },
    setPollingInterval: (state, action) => {
      state.pollingInterval = action.payload;
      try {
        localStorage.setItem('fleetpulse_settings', JSON.stringify(state));
      } catch (e) {}
    },
    toggleLiveUpdates: (state) => {
      state.isLiveUpdatesEnabled = !state.isLiveUpdatesEnabled;
      try {
        localStorage.setItem('fleetpulse_settings', JSON.stringify(state));
      } catch (e) {}
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      try {
        localStorage.setItem('fleetpulse_settings', JSON.stringify(state));
      } catch (e) {}
    },
    updateThresholds: (state, action) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
      try {
        localStorage.setItem('fleetpulse_settings', JSON.stringify(state));
      } catch (e) {}
    },
    resetSettings: (state) => {
      state.pollingInterval = 10000;
      state.isLiveUpdatesEnabled = true;
      state.notificationsEnabled = true;
      state.thresholds = {
        temperatureWarning: DEFAULT_THRESHOLDS.TEMPERATURE_WARNING,
        temperatureCritical: DEFAULT_THRESHOLDS.TEMPERATURE_CRITICAL,
        fuelWarning: DEFAULT_THRESHOLDS.FUEL_WARNING,
        batteryWarning: DEFAULT_THRESHOLDS.BATTERY_WARNING,
      };
      try {
        localStorage.removeItem('fleetpulse_settings');
      } catch (e) {}
    },
  },
});

export const {
  setTheme,
  setPollingInterval,
  toggleLiveUpdates,
  toggleNotifications,
  updateThresholds,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
