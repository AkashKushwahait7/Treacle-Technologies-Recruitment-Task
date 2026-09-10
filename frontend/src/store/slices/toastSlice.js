import { createSlice } from '@reduxjs/toolkit';

let nextToastId = 1;

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { type = 'info', title, message, duration = 4000 } = action.payload;
      const id = nextToastId++;
      state.toasts.push({ id, type, title, message, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
