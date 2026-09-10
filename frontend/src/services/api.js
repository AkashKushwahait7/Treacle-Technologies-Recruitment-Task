import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let storeInstance = null;

export const injectStore = (store) => {
  storeInstance = store;
};

// Response Interceptor for Global 401 & Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const currentPath = window.location.pathname;

    if (status === 401 && currentPath !== '/login') {
      console.warn('[API Interceptor] 401 Unauthorized detected. Clearing session.');
      if (storeInstance) {
        // Dispatch session expiration to Redux
        storeInstance.dispatch({ type: 'auth/sessionExpired' });
        storeInstance.dispatch({
          type: 'toast/addToast',
          payload: {
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session has ended. Please sign in again.',
          },
        });
      }
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Dashboard Endpoints
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getAlerts: (params) => api.get('/dashboard/alerts', { params }),
  getTrends: (period = '24h') => api.get('/dashboard/trends', { params: { period } }),
};

// Vehicles Endpoints
export const vehicleAPI = {
  getVehicles: (params) => api.get('/vehicles', { params }),
  getVehicleById: (vehicleId) => api.get(`/vehicles/${vehicleId}`),
  getVehicleTelemetry: (vehicleId, limit = 50) =>
    api.get(`/vehicles/${vehicleId}/telemetry`, { params: { limit } }),
  getVehicleAlerts: (vehicleId, params) =>
    api.get(`/vehicles/${vehicleId}/alerts`, { params }),
};

// Alerts Endpoints
export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  resolveAlert: (id) => api.patch(`/alerts/${id}/resolve`),
};

export default api;
