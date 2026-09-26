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

// GET all vehicles
export const fetchVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data.data || [];
};

// GET single vehicle
export const fetchVehicleById = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data.data;
};

// CREATE vehicle
export const addVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data.data;
};

// UPDATE vehicle
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data.data;
};

// DELETE vehicle
export const deleteVehicle = async (id) => {
  await api.delete(`/vehicles/${id}`);
  return true;
};