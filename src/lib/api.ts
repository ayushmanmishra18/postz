import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const tokenStorage = {
  get: async (key: string) =>
    Platform.OS === 'web'
      ? (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null)
      : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  remove: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const accessToken = await tokenStorage.get('accessToken');
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearAuth();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await tokenStorage.get('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      await tokenStorage.set('accessToken', accessToken);
      await tokenStorage.set('refreshToken', newRefreshToken);

      return accessToken;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async clearAuth(): Promise<void> {
    await tokenStorage.remove('accessToken');
    await tokenStorage.remove('refreshToken');
    await tokenStorage.remove('user');
  }

  async get<T>(url: string, config?: { params?: object }) {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: object) {
    return this.client.post<T>(url, data);
  }

  async put<T>(url: string, data?: object) {
    return this.client.put<T>(url, data);
  }

  async patch<T>(url: string, data?: object) {
    return this.client.patch<T>(url, data);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }

  async upload<T>(url: string, formData: FormData) {
    return this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const api = new ApiClient();