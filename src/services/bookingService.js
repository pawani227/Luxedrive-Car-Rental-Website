import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// CREATE a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data.data;
};

// GET all bookings (Admin)
export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.data || [];
};

// GET bookings for a specific customer
export const getMyBookings = async (customerId) => {
  const response = await api.get(`/bookings/customer/${customerId}`);
  return response.data.data || [];
};

// GET bookings for a specific provider
export const getProviderBookings = async (providerId) => {
  const response = await api.get(`/bookings/provider/${providerId}`);
  return response.data.data || [];
};

// GET admin stats
export const getBookingStats = async () => {
  const response = await api.get('/bookings/stats');
  return response.data.data || {};
};

// UPDATE booking status
export const updateBookingStatus = async (id, status) => {
  const response = await api.put(`/bookings/${id}/status`, { status });
  return response.data.data;
};

// DELETE booking (Admin)
export const deleteBooking = async (id) => {
  await api.delete(`/bookings/${id}`);
  return true;
};

// GET active bookings for a specific vehicle
export const getVehicleBookings = async (vehicleId) => {
  const response = await api.get(`/bookings/vehicle/${vehicleId}`);
  return response.data.data || [];
};
