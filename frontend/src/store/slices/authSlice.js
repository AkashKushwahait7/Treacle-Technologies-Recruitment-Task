import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api.js';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(formData);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Not authenticated');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authAPI.logout();
  } catch (err) {
    console.warn('Logout API error:', err);
  }
  return true;
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // true on initial bootstrap while validating /api/auth/me
  actionLoading: false,
  error: null,
  sessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    sessionExpired: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
      state.loading = false;
    },
    resetSessionExpired: (state) => {
      state.sessionExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User on Startup
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.sessionExpired = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.actionLoading = false;
        state.error = null;
        state.sessionExpired = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.actionLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.actionLoading = false;
        state.loading = false;
      });
  },
});

export const { clearError, sessionExpired, resetSessionExpired } = authSlice.actions;
export default authSlice.reducer;
