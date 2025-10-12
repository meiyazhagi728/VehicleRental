import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  mechanics: [],
  mechanic: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMechanics: 0,
  },
};

// Get all mechanics
export const getMechanics = createAsyncThunk(
  'mechanics/getAll',
  async (filters, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      
      console.log('API call to mechanics with params:', params.toString());
      const response = await api.get(`/mechanics?${params}`);
      console.log('Mechanics API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Mechanics API error:', error);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get nearby mechanics
export const getNearbyMechanics = createAsyncThunk(
  'mechanics/getNearby',
  async (locationData, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      params.append('lat', locationData.lat);
      params.append('lng', locationData.lng);
      if (locationData.maxDistance) {
        params.append('maxDistance', locationData.maxDistance);
      }
      
      const response = await api.get(`/mechanics/nearby?${params}`);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single mechanic
export const getMechanic = createAsyncThunk(
  'mechanics/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/mechanics/${id}`);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create mechanic profile
export const createMechanicProfile = createAsyncThunk(
  'mechanics/createProfile',
  async (mechanicData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.post('/mechanics', mechanicData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update mechanic profile
export const updateMechanicProfile = createAsyncThunk(
  'mechanics/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.put('/mechanics/profile', profileData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update mechanic availability
export const updateMechanicAvailability = createAsyncThunk(
  'mechanics/updateAvailability',
  async (availabilityData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.put('/mechanics/availability', availabilityData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add review to mechanic
export const addMechanicReview = createAsyncThunk(
  'mechanics/addReview',
  async ({ id, reviewData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.post(`/mechanics/${id}/reviews`, reviewData, config);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const mechanicSlice = createSlice({
  name: 'mechanics',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearMechanic: (state) => {
      state.mechanic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMechanics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMechanics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mechanics = action.payload.mechanics;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMechanics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getNearbyMechanics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNearbyMechanics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mechanics = action.payload.mechanics;
      })
      .addCase(getNearbyMechanics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMechanic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMechanic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mechanic = action.payload;
      })
      .addCase(getMechanic.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createMechanicProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMechanicProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mechanics.unshift(action.payload);
      })
      .addCase(createMechanicProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMechanicProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMechanicProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.mechanics.findIndex(
          (mechanic) => mechanic._id === action.payload._id
        );
        if (index !== -1) {
          state.mechanics[index] = action.payload;
        }
        if (state.mechanic && state.mechanic._id === action.payload._id) {
          state.mechanic = action.payload;
        }
      })
      .addCase(updateMechanicProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMechanicAvailability.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMechanicAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.mechanics.findIndex(
          (mechanic) => mechanic._id === action.payload.mechanic._id
        );
        if (index !== -1) {
          state.mechanics[index] = action.payload.mechanic;
        }
        if (state.mechanic && state.mechanic._id === action.payload.mechanic._id) {
          state.mechanic = action.payload.mechanic;
        }
      })
      .addCase(updateMechanicAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addMechanicReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMechanicReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.mechanic && state.mechanic._id === action.payload._id) {
          state.mechanic = action.payload;
        }
      })
      .addCase(addMechanicReview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearMechanic } = mechanicSlice.actions;
export default mechanicSlice.reducer;
