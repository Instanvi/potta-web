import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_URL } from "./env";

// Main API client
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Authentication and session-related client
export const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL!,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor for the main client
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession() as any;
      const token = session?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Request interceptor for the auth client
authClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession() as any;
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Unified response error handler
function handleResponseError(error: AxiosError) {
  if (typeof window === "undefined") return Promise.reject(error);

  const status = error.response?.status;
  
  if (status === 401) {
    // Optional: Clear session and redirect to sign-in on 401
    // signOut({ callbackUrl: "/sign-in" });
  }

  return Promise.reject(error);
}

// Response interceptor for the main client
apiClient.interceptors.response.use(
  (response) => {
    // Only return data if status is 200/201 (as expected in existing codebase)
    if ([200, 201].includes(response.status)) {
      return response.data || response;
    }
    return response.data;
  },
  handleResponseError,
);

// Response interceptor for the auth client
authClient.interceptors.response.use(
  (response) => response.data,
  handleResponseError,
);

// Legacy/Compatibility exports
export const refreshTokenAPI = async (refresh_token: string): Promise<{ access_token: string, refresh_token: string }> => {
  const response = await apiClient.post(`/auth/refresh_token/`, { refresh_token });
  return response as any;
};

export default apiClient;
