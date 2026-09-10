import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import alertsReducer from './slices/alertsSlice.js';
import vehiclesReducer from './slices/vehiclesSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import toastReducer from './slices/toastSlice.js';
import { injectStore } from '../services/api.js';
import socketService from '../services/socket.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    alerts: alertsReducer,
    vehicles: vehiclesReducer,
    settings: settingsReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Inject store into api interceptors & socket service
injectStore(store);
socketService.init(store);

export default store;
