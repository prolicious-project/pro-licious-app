// src/lib/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://pro-licious-be.vercel.app';

export const api = axios.create({
  baseURL: BASE_URL,
  // 8s timeout: fast enough to avoid Android ANR errors,
  // long enough to handle typical Vercel cold starts.
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
