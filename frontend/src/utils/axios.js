import axios from 'axios';
import { getToken } from './auth';
import { loadingManager } from './loadingManager';

const normalizeApiUrl = (value) => {
  if (!value) return '';
  // Ensure no trailing slash so we can safely append `/api`.
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed;
};

const rawApiUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);
// REACT_APP_API_URL should point to your backend host, e.g.:
// - http://localhost:5000
// - https://freshbite-backend-production.up.railway.app
const apiBaseUrl = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : '/api'; // fallback for local/dev if env is not set

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    loadingManager.start();
    return config;
  },
  (error) => {
    loadingManager.stop();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    loadingManager.stop();
    return response;
  },
  (error) => {
    loadingManager.stop();
    return Promise.reject(error);
  }
);

export default api;

