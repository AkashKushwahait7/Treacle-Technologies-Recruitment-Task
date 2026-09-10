import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api.js';

export const fetchSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getSummary();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

export const fetchTrends = createAsyncThunk(
  'dashboard/fetchTrends',
  async (period = '24h', { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTrends(period);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch trends');
    }
  }
);

const initialState = {
  socketStatus: 'disconnected', // 'connected' | 'disconnected' | 'reconnecting' | 'paused'
  isPaused: false,
  lastLiveTimestamp: null,
  lastPollingTimestamp: null,
  summary: null,
  summaryLoading: false,
  summaryError: null,
  trends: null,
  trendsLoading: false,
  trendsError: null,
  selectedPeriod: '24h',
  selectedMetric: 'speed', // 'speed' | 'fuel' | 'temp' | 'battery'
  liveMetrics: {
    averageSpeed: 64.2,
    averageFuelLevel: 68.4,
    engineTemperature: 82.7,
    fleetHealth: 88,
    activeVehicles: 16,
    criticalAlerts: 1,
  },
  trailingPoints: [], // Trailing 25 points for interactive real-time chart
  liveEventFeed: [],  // Trailing 20 live telemetry events
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSocketStatus: (state, action) => {
      state.socketStatus = state.isPaused ? 'paused' : action.payload;
    },
    togglePauseLive: (state) => {
      state.isPaused = !state.isPaused;
      state.socketStatus = state.isPaused ? 'paused' : 'connected';
    },
    setSelectedMetric: (state, action) => {
      state.selectedMetric = action.payload;
    },
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    handleLiveTelemetry: (state, action) => {
      if (state.isPaused) return;

      const telemetry = action.payload;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      state.lastLiveTimestamp = telemetry.timestamp || now.toISOString();

      // 1. Update trailing points for real-time chart (keep last 25)
      const newPoint = {
        time: timeStr,
        vehicleId: telemetry.vehicleId,
        speed: telemetry.speed,
        fuel: telemetry.fuelLevel,
        temp: telemetry.engineTemperature,
        battery: telemetry.batteryLevel,
      };

      const updatedPoints = [...state.trailingPoints, newPoint];
      if (updatedPoints.length > 25) {
        updatedPoints.shift();
      }
      state.trailingPoints = updatedPoints;

      // 2. Add event to feed (keep last 20)
      let message = `Speed maintained at ${telemetry.speed} km/h`;
      if (telemetry.eventType === 'ALERT') {
        if (telemetry.engineTemperature >= 90) {
          message = `Engine temp high (${telemetry.engineTemperature}°C)`;
        } else if (telemetry.fuelLevel <= 25) {
          message = `Low fuel alert (${telemetry.fuelLevel}%)`;
        } else if (telemetry.batteryLevel <= 30) {
          message = `Low battery alert (${telemetry.batteryLevel}%)`;
        } else {
          message = `Threshold warning triggered`;
        }
      } else if (telemetry.eventType === 'RECOVERY') {
        message = `Vehicle recovered to optimal operating status`;
      } else {
        message = `Live telemetry updated (${telemetry.speed} km/h, ${telemetry.fuelLevel}% fuel)`;
      }

      const feedItem = {
        id: `${telemetry.vehicleId}-${Date.now()}-${Math.random()}`,
        time: timeStr,
        vehicleId: telemetry.vehicleId,
        speed: telemetry.speed,
        fuel: telemetry.fuelLevel,
        temp: telemetry.engineTemperature,
        battery: telemetry.batteryLevel,
        status: telemetry.status,
        eventType: telemetry.eventType,
        message,
      };

      state.liveEventFeed = [feedItem, ...state.liveEventFeed.slice(0, 19)];

      // 3. Incrementally update active metrics
      if (state.summary) {
        // Smoothly adjust average speed and temperature from incoming events
        const alpha = 0.05;
        state.liveMetrics.averageSpeed = Number(
          (state.liveMetrics.averageSpeed * (1 - alpha) + telemetry.speed * alpha).toFixed(1)
        );
        state.liveMetrics.engineTemperature = Number(
          (state.liveMetrics.engineTemperature * (1 - alpha) + telemetry.engineTemperature * alpha).toFixed(1)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary Polling Reducer
      .addCase(fetchSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload.data;
        state.lastPollingTimestamp = action.payload.lastUpdated || new Date().toISOString();
        if (action.payload.data) {
          state.liveMetrics = {
            averageSpeed: action.payload.data.averageSpeed,
            averageFuelLevel: action.payload.data.averageFuelLevel,
            engineTemperature: action.payload.data.averageTemperature,
            fleetHealth: action.payload.data.fleetHealth,
            activeVehicles: action.payload.data.activeVehicles,
            criticalAlerts: action.payload.data.activeAlerts,
          };
        }
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload;
      })
      // Trends Reducer
      .addCase(fetchTrends.pending, (state) => {
        state.trendsLoading = true;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.trendsLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.trendsLoading = false;
        state.trendsError = action.payload;
      });
  },
});

export const {
  setSocketStatus,
  togglePauseLive,
  setSelectedMetric,
  setSelectedPeriod,
  handleLiveTelemetry,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
