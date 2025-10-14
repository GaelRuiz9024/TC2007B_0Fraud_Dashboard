// gaelruiz9024/tc2007b_0fraud_dashboard/src/lib/api.ts
import axios from 'axios';

// URL base del backend NestJS
const API_BASE_URL = 'http://localhost:4000'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para inyectar el Access Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);