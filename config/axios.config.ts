import Axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { getSession } from 'next-auth/react';

const createAxiosInstance = () => {
  return Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.instanvi.com',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const axios = createAxiosInstance();

axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (typeof window !== 'undefined') {
      const session = await getSession();
      const token = (session as any)?.accessToken || (session?.user as any)?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
