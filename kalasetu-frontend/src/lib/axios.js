import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: API_CONFIG.WITH_CREDENTIALS, // Important for cookie-based auth
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    
    // If we get HTML instead of JSON, it's likely a CORS or routing issue
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<html')) {
      console.error('Received HTML instead of JSON - likely CORS or routing issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;
