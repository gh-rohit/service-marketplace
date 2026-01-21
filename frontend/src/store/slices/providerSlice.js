// frontend/src/store/slices/providerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { providersAPI } from '../../services/api';

export const fetchProviders = createAsyncThunk(
  'providers/fetchProviders',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await providersAPI.getApproved(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch providers');
    }
  }
);

export const fetchProviderById = createAsyncThunk(
  'providers/fetchProviderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await providersAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch provider details');
    }
  }
);

export const updateProviderProfile = createAsyncThunk(
  'providers/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await providersAPI.updateProviderProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

const providerSlice = createSlice({
  name: 'providers',
  initialState: {
    providers: [],
    currentProvider: null,
    loading: false,
    error: null,
    filters: {
      profession: '',
      city: '',
      minRating: ''
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProvider: (state) => {
      state.currentProvider = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Providers
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload.providers;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Provider by ID
      .addCase(fetchProviderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProvider = action.payload.provider;
      })
      .addCase(fetchProviderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Provider Profile
      .addCase(updateProviderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProviderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProvider = action.payload.provider;
      })
      .addCase(updateProviderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearError, clearCurrentProvider } = providerSlice.actions;
export default providerSlice.reducer;