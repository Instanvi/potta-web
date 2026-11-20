/**
 * Authentication Configuration
 * Centralized configuration for authentication across all environments
 */

// Environment detection
export const getEnvironment = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  }

  return 'production';
};

// Configuration based on environment
export const getAuthConfig = () => {
  const env = getEnvironment();

  // Check if we're on organigram page to determine API URL
  const isOrganigramPage =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('organigram');
  const apiUrl = isOrganigramPage
    ? process.env.NEXT_PUBLIC_AUTH_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL;

  const configs = {
    development: {
      authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
      apiUrl: apiUrl,
      useTestToken: true,
      testToken: 'F3y2kERtEWsv8UBMrltIIkyMdns9fo3B',
      enableLogging: true,
      tokenExpiry: 7, // days
      refreshBeforeExpiry: 24, // hours
      encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTION_SECRET,
      salt: process.env.NEXT_PUBLIC_SALT,
    },
    staging: {
      authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
      apiUrl: apiUrl,
      useTestToken: false,
      testToken: null,
      enableLogging: true,
      tokenExpiry: 7,
      refreshBeforeExpiry: 24,
      encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || '',
      salt: process.env.NEXT_PUBLIC_SALT || '',
    },
    production: {
      authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
      apiUrl: apiUrl,
      useTestToken: false,
      testToken: null,
      enableLogging: false,
      tokenExpiry: 7,
      refreshBeforeExpiry: 24,
      encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || '',
      salt: process.env.NEXT_PUBLIC_SALT || '',
    },
    server: {
      authUrl:
        process.env.NEXT_PUBLIC_AUTH_URL || 'https://instanvi-auth.vercel.app',
      apiUrl: apiUrl || 'https://api.instanvi.com',
      useTestToken: false,
      testToken: null,
      enableLogging: false,
      tokenExpiry: 7,
      refreshBeforeExpiry: 24,
      encryptionSecret: process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || '',
      salt: process.env.NEXT_PUBLIC_SALT || '',
    },
  };

  return configs[env as keyof typeof configs];
};

// Routes that bypass authentication
export const BYPASS_AUTH_ROUTES = [
  '/vendor-portal',
  '/vendor-portal/kyc/verify',
  '/vendor-portal/rfqs',
  '/public',
  '/api/public',
  // Add more public routes as needed
];

// Public paths for middleware
export const PUBLIC_PATHS = [
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/images',
  '/icons',
  '/fonts',
  '/vendor-portal',
  '/vendor/kyc/verify',
  '/vendor/rfqs',
];

// Token storage keys
export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'user_data';

// API endpoints
export const AUTH_ENDPOINTS = {
  whoami: '/whoami',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

// Error messages
export const AUTH_ERRORS = {
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_INVALID: 'Invalid authentication token. Please login again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
};
