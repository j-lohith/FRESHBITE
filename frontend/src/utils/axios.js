import axios from 'axios';
import { getToken } from './auth';
import { loadingManager } from './loadingManager';

const api = axios.create({
  baseURL: '/api',
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

