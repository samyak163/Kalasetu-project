import axios from 'axios';

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://kalasetu-api-k2d8.onrender.com',
  withCredentials: true, // Important for cookie-based auth
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
