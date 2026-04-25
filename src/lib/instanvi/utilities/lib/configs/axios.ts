import axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { API_URL } from './env';
import { auth } from '@/auth';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL!;

export const authClient = axios.create({
  baseURL: authApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

function handleResponseError(error: AxiosError) {
  if (typeof window === 'undefined') return Promise.reject(error);
  return Promise.reject(error);
}

apiClient.interceptors.response.use((response) => {
  if ([200, 201].includes(response.status)) {
    return response.data || response;
  }
  return response.data;
}, handleResponseError);

authClient.interceptors.response.use(
  (response) => response.data,
  handleResponseError
);

export const refreshTokenAPI = async (
  refresh_token: string
): Promise<{ access_token: string; refresh_token: string }> => {
  const response = await apiClient.post(`/auth/refresh_token/`, {
    refresh_token,
  });
  return response as any;
};

export default apiClient;
