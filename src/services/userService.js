import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to every request automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Register user
export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data.data;
};

// Login user
export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data.data;
};

// Get all users (Admin)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data || [];
};

// Block/Unblock user (Admin)
export const blockUser = async (id, isBlocked) => {
  const response = await api.put(`/users/${id}/block`, { isBlocked });
  return response.data.data;
};

// Delete user (Admin)
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data.success;
};
