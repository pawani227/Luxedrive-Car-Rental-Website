import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Submit new feedback
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.errors 
      ? error.response.data.errors.join(', ')
      : error.response?.data?.message;
    throw new Error(errorMsg || 'Failed to submit feedback');
  }
};

// Get all feedback (for home page or feedback page)
export const fetchFeedbacks = async (limit = null) => {
  try {
    const url = limit ? `/feedback?limit=${limit}` : '/feedback';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch feedback');
  }
};

// Delete feedback (admin)
export const deleteFeedback = async (id) => {
  try {
    await api.delete(`/feedback/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete feedback');
  }
};