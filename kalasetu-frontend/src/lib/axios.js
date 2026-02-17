import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';

// --- CSRF token management ---
// Stored in memory (not localStorage) — cleared on page close, resistant to XSS exfiltration
let csrfToken = null;

export const setCsrfToken = (token) => { csrfToken = token; };
export const getCsrfToken = () => csrfToken;

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: API_CONFIG.WITH_CREDENTIALS, // Important for cookie-based auth
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// State-changing methods that require CSRF protection
const CSRF_METHODS = new Set(['post', 'put', 'patch', 'delete']);

// Request interceptor: attach CSRF token on state-changing requests
api.interceptors.request.use(
  (config) => {
    if (csrfToken && CSRF_METHODS.has(config.method)) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
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
    }
    return Promise.reject(error);
  }
);

export default api;
