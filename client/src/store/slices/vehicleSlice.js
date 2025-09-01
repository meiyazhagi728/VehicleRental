import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  vehicles: [],
  vehicle: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalVehicles: 0,
  },
};

// Get all vehicles
export const getVehicles = createAsyncThunk(
  'vehicles/getAll',
  async (filters, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      
      const response = await axios.get(`/api/vehicles?${params}`);
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

// Get single vehicle
export const getVehicle = createAsyncThunk(
  'vehicles/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`/api/vehicles/${id}`);
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

// Create vehicle
export const createVehicle = createAsyncThunk(
  'vehicles/create',
  async (vehicleData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post('/api/vehicles', vehicleData, config);
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

// Update vehicle
export const updateVehicle = createAsyncThunk(
  'vehicles/update',
  async ({ id, vehicleData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`/api/vehicles/${id}`, vehicleData, config);
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

// Delete vehicle
export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/vehicles/${id}`, config);
      return id;
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

// Add review to vehicle
export const addVehicleReview = createAsyncThunk(
  'vehicles/addReview',
  async ({ id, reviewData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`/api/vehicles/${id}/reviews`, reviewData, config);
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

export const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearVehicle: (state) => {
      state.vehicle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVehicles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vehicles = action.payload.vehicles;
        state.pagination = action.payload.pagination;
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vehicle = action.payload;
      })
      .addCase(getVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vehicles.unshift(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.vehicles.findIndex(
          (vehicle) => vehicle._id === action.payload._id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        if (state.vehicle && state.vehicle._id === action.payload._id) {
          state.vehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle._id !== action.payload
        );
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addVehicleReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addVehicleReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.vehicle && state.vehicle._id === action.payload._id) {
          state.vehicle = action.payload;
        }
      })
      .addCase(addVehicleReview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
