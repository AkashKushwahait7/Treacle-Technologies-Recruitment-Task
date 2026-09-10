import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleAPI } from '../../services/api.js';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getVehicles(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const fetchVehicleDetails = createAsyncThunk(
  'vehicles/fetchVehicleDetails',
  async (vehicleId, { rejectWithValue }) => {
    try {
      const [detailsRes, telemetryRes, alertsRes] = await Promise.all([
        vehicleAPI.getVehicleById(vehicleId),
        vehicleAPI.getVehicleTelemetry(vehicleId, 30),
        vehicleAPI.getVehicleAlerts(vehicleId),
      ]);
      return {
        vehicle: detailsRes.data.data,
        telemetry: telemetryRes.data.data,
        alerts: alertsRes.data.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vehicle details');
    }
  }
);

const initialState = {
  vehicles: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  selectedVehicle: null,
  selectedVehicleTelemetry: [],
  selectedVehicleAlerts: [],
  detailsLoading: false,
  isModalOpen: false,
  filters: {
    status: 'ALL',
    search: '',
    vehicleType: '',
    page: 1,
    limit: 20,
  },
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    closeVehicleModal: (state) => {
      state.selectedVehicle = null;
      state.selectedVehicleTelemetry = [];
      state.selectedVehicleAlerts = [];
      state.isModalOpen = false;
    },
    updateVehicleTelemetry: (state, action) => {
      const telemetry = action.payload;
      // Update item in vehicles list
      const idx = state.vehicles.findIndex((v) => v.vehicleId === telemetry.vehicleId);
      if (idx !== -1) {
        state.vehicles[idx] = {
          ...state.vehicles[idx],
          currentSpeed: telemetry.speed,
          fuelLevel: telemetry.fuelLevel,
          engineTemperature: telemetry.engineTemperature,
          batteryLevel: telemetry.batteryLevel,
          status: telemetry.status,
          location: telemetry.location || state.vehicles[idx].location,
          totalDistance: telemetry.totalDistance || state.vehicles[idx].totalDistance,
          lastTelemetryAt: telemetry.timestamp,
        };
      }

      // If this vehicle is currently open in details modal, update it in real-time!
      if (state.selectedVehicle && state.selectedVehicle.vehicleId === telemetry.vehicleId) {
        state.selectedVehicle = {
          ...state.selectedVehicle,
          currentSpeed: telemetry.speed,
          fuelLevel: telemetry.fuelLevel,
          engineTemperature: telemetry.engineTemperature,
          batteryLevel: telemetry.batteryLevel,
          status: telemetry.status,
          location: telemetry.location || state.selectedVehicle.location,
          totalDistance: telemetry.totalDistance || state.selectedVehicle.totalDistance,
          lastTelemetryAt: telemetry.timestamp,
        };

        const newPoint = {
          timestamp: telemetry.timestamp,
          speed: telemetry.speed,
          fuelLevel: telemetry.fuelLevel,
          engineTemperature: telemetry.engineTemperature,
          batteryLevel: telemetry.batteryLevel,
        };
        state.selectedVehicleTelemetry = [...state.selectedVehicleTelemetry.slice(-29), newPoint];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
        state.totalPages = action.payload.pagination?.totalPages || 1;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleDetails.pending, (state) => {
        state.detailsLoading = true;
        state.isModalOpen = true;
      })
      .addCase(fetchVehicleDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedVehicle = action.payload.vehicle;
        state.selectedVehicleTelemetry = action.payload.telemetry || [];
        state.selectedVehicleAlerts = action.payload.alerts || [];
      })
      .addCase(fetchVehicleDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilter,
  setPage,
  closeVehicleModal,
  updateVehicleTelemetry,
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
