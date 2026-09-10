import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertAPI, dashboardAPI } from '../../services/api.js';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await alertAPI.getAlerts(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const resolveAlertThunk = createAsyncThunk(
  'alerts/resolveAlert',
  async (id, { rejectWithValue }) => {
    try {
      const response = await alertAPI.resolveAlert(id);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resolve alert');
    }
  }
);

const initialState = {
  alerts: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
  selectedAlert: null,
  isModalOpen: false,
  filters: {
    severity: '',
    status: '',
    vehicleId: '',
    search: '',
    page: 1,
    limit: 15,
  },
  stats: {
    critical: 0,
    warning: 0,
    active: 0,
    resolved: 0,
  },
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    openAlertModal: (state, action) => {
      state.selectedAlert = action.payload;
      state.isModalOpen = true;
    },
    closeAlertModal: (state) => {
      state.selectedAlert = null;
      state.isModalOpen = false;
    },
    handleNewAlert: (state, action) => {
      const newAlert = action.payload;
      // Prepend to alerts list
      state.alerts = [newAlert, ...state.alerts.filter((a) => a._id !== newAlert._id)];
      state.total += 1;
      state.stats.active += 1;
      if (newAlert.severity === 'CRITICAL') state.stats.critical += 1;
      if (newAlert.severity === 'WARNING') state.stats.warning += 1;
    },
    handleResolvedAlert: (state, action) => {
      const resolved = action.payload;
      state.alerts = state.alerts.map((a) =>
        a._id === resolved._id ? { ...a, status: 'RESOLVED', resolvedAt: resolved.resolvedAt } : a
      );
      state.stats.active = Math.max(0, state.stats.active - 1);
      state.stats.resolved += 1;
      if (state.selectedAlert && state.selectedAlert._id === resolved._id) {
        state.selectedAlert.status = 'RESOLVED';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
        state.totalPages = action.payload.pagination?.totalPages || 1;

        // Compute local stats
        let crit = 0, warn = 0, act = 0, res = 0;
        state.alerts.forEach((a) => {
          if (a.status === 'ACTIVE') {
            act++;
            if (a.severity === 'CRITICAL') crit++;
            if (a.severity === 'WARNING') warn++;
          } else {
            res++;
          }
        });
        state.stats = { critical: crit, warning: warn, active: act, resolved: res };
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resolveAlertThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.alerts = state.alerts.map((a) =>
          a._id === updated._id ? { ...a, status: 'RESOLVED', resolvedAt: updated.resolvedAt } : a
        );
        if (state.selectedAlert && state.selectedAlert._id === updated._id) {
          state.selectedAlert.status = 'RESOLVED';
        }
      });
  },
});

export const {
  setFilter,
  setPage,
  openAlertModal,
  closeAlertModal,
  handleNewAlert,
  handleResolvedAlert,
} = alertsSlice.actions;

export default alertsSlice.reducer;
