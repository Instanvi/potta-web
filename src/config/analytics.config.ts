import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// Potta FP&A Analytics API Configuration
const ANALYTICS_BASE_URL =
  process.env.ANALYTICS_BASE_URL || 'https://tribu.dev.instanvi.com/corelytics';
const ANALYTICS_TIMEOUT = 30000; // 30 seconds

// Create dedicated Axios instance for Analytics API
const analyticsAxios: AxiosInstance = axios.create({
  baseURL: ANALYTICS_BASE_URL,
  timeout: ANALYTICS_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for logging and request modification
analyticsAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header with Bearer token from cookies
    let token = null;

    // Check cookies for auth_token
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('auth_token=')
      );
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Development logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('ANALYTICS REQUEST:', {
        url: (config.baseURL || '') + (config.url || ''),
        method: config.method,
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Potta FP&A API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
analyticsAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('ANALYTICS RESPONSE:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('ANALYTICS RESPONSE ERROR:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        import("@/lib/auth-sign-out").then(({ signOutWithAuthApi }) => {
          void signOutWithAuthApi({ callbackUrl: "/login" });
        });
      }
    } else if (error.response?.status === 404) {
      console.warn('⚠️ Potta FP&A API: Resource not found');
    }

    return Promise.reject(error);
  }
);

// Helper functions for common analytics operations
export const analyticsConfig = {
  // Get the configured axios instance
  getAxiosInstance: (): AxiosInstance => analyticsAxios,

  // Get base URL
  getBaseURL: (): string => ANALYTICS_BASE_URL,

  // Get timeout
  getTimeout: (): number => ANALYTICS_TIMEOUT,

  // Helper to build URL with parameters
  buildURL: (endpoint: string, params?: Record<string, any>): string => {
    const url = new URL(`${ANALYTICS_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  },

  // Helper to validate analytics response
  validateResponse: (response: any): boolean => {
    return (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      'metadata' in response
    );
  },

  // Helper to extract error message
  getErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred with the Potta FP&A API';
  },
};

// Export the configured axios instance as default
export default analyticsAxios;

// Export types for better TypeScript support
export interface AnalyticsRequestConfig extends InternalAxiosRequestConfig {
  useMockData?: boolean;
  cacheResults?: boolean;
}

export interface AnalyticsResponse<T = any> extends AxiosResponse<T> {
  data: T;
  metadata?: {
    row_count: number;
    columns: string[];
  };
}
