// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import providerReducer from './slices/providerSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    providers: providerReducer,
    notifications: notificationReducer,
  },
});