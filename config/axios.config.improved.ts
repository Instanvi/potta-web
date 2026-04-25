import Axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosError,
} from 'axios';
import {
  getAuthConfig,
  getEnvironment,
  BYPASS_AUTH_ROUTES,
  TOKEN_STORAGE_KEY,
  AUTH_ERRORS,
} from './auth.config';

// Create axios instance with dynamic base URL
const createAxiosInstance = () => {
  const config = getAuthConfig();

  return Axios.create({
    baseURL: config.apiUrl,
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const axios = createAxiosInstance();

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

// Get token from various sources
function getToken(): string | null {
  // Use in-memory token first
  if (authToken) return authToken;

  // Check cookies
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${TOKEN_STORAGE_KEY}=`)
    );
    if (authCookie) {
      return authCookie.split('=')[1];
    }

    // Check localStorage as fallback
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (localToken) return localToken;
  }

  return null;
}

// Check if current route bypasses auth
function isBypassRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const currentPath = window.location.pathname;
  return BYPASS_AUTH_ROUTES.some((route) => currentPath.includes(route));
}

// Clear all auth data
function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  // Clear cookies
  document.cookie = `${TOKEN_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

  // Clear localStorage
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem('user_data');

  // Clear in-memory token
  authToken = null;
}

// Redirect to auth page
function redirectToAuth(): void {
  if (typeof window === 'undefined') return;

  const config = getAuthConfig();
  const authUrlStr = config.authUrl || 'https://auth.instanvi.com';
  const authUrl = new URL(authUrlStr);
  authUrl.searchParams.set('callbackUrl', window.location.href);
  window.location.href = authUrl.toString();
}

// Request retry configuration
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.response.status === 429
    );
  },
};

// Retry logic
async function retryRequest(
  config: InternalAxiosRequestConfig,
  retries = retryConfig.retries
): Promise<AxiosResponse> {
  try {
    return await axios.request(config);
  } catch (error) {
    const axiosError = error as AxiosError;

    if (retries > 0 && retryConfig.retryCondition(axiosError)) {
      await new Promise((resolve) =>
        setTimeout(resolve, retryConfig.retryDelay)
      );
      return retryRequest(config, retries - 1);
    }

    throw error;
  }
}

// Request interceptor
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authConfig = getAuthConfig();

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    // Handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add authorization header
    const token = getToken();
    const isPublicRoute = isBypassRoute();

    if (token && !isPublicRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-Id'] = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Development logging
    if (authConfig.enableLogging) {
      console.log('[Axios Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        params: config.params,
        data: config.data instanceof FormData ? 'FormData' : config.data,
      });
    }

    return config;
  },
  (error) => {
    const authConfig = getAuthConfig();
    if (authConfig.enableLogging) {
      console.error('[Axios Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    const authConfig = getAuthConfig();

    // Development logging
    if (authConfig.enableLogging) {
      console.log('[Axios Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data,
        headers: response.headers,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const authConfig = getAuthConfig();
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Development logging
    if (authConfig.enableLogging) {
      console.error('[Axios Response Error]', {
        status: error.response?.status,
        url: originalRequest?.url,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        message: AUTH_ERRORS.NETWORK_ERROR,
      });
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const isPublicRoute = isBypassRoute();
      const environment = getEnvironment();

      if (isPublicRoute) {
        // Let component handle the error for public routes
        return Promise.reject(error);
      }

      // In development, just log the error
      if (environment === 'development') {
        console.warn('401 Unauthorized in development mode');
        return Promise.reject(error);
      }

      // In production, clear auth and redirect
      clearAuthData();
      redirectToAuth();

      return Promise.reject({
        ...error,
        message: AUTH_ERRORS.TOKEN_EXPIRED,
      });
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject({
        ...error,
        message: AUTH_ERRORS.UNAUTHORIZED,
      });
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

      if (authConfig.enableLogging) {
        console.log(`Rate limited. Retrying after ${delay}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return axios.request(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Export helper functions
export const axiosHelpers = {
  setToken: setAuthToken,
  getToken,
  clearAuth: clearAuthData,
  isAuthenticated: () => !!getToken(),
};

export default axios;
