import Axios, { AxiosError } from 'axios';
import { getSession } from 'next-auth/react';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/access-token';
import { handleSessionExpired, isSessionExpired } from '@/lib/session-expired';
import {
  getStoredLocationId,
  getStoredOrganizationId,
  useAuthContextStore,
} from '@/store/use-auth-context-store';

/** potta-backend serves every route under its API_PREFIX ("api"), so the base always ends in /api/. */
export function withApiPrefix(raw: string): string {
  const base = raw.trim().replace(/\/+$/, '');
  return `${/\/api$/i.test(base) ? base : `${base}/api`}/`;
}

export const API_BASE_URL = withApiPrefix(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://potta.dev.instanvi.com/api/'
);

export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3002/api';

/** potta-backend (POS + Books). */
export const apiClient = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

/** instanvi-auth-starter (IdP). */
export const authClient = Axios.create({
  baseURL: AUTH_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const PUBLIC_PATHS = ['/login', '/auth-callback', '/vendor-portal'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function resolveBearerToken(): Promise<string | null> {
  if (isSessionExpired()) return null;
  const cached = getAccessToken();
  if (cached) return cached;
  try {
    const session = await getSession();
    const token = session?.accessToken || session?.user?.accessToken || null;
    if (token) setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

function rejectWhileSigningOut() {
  return Promise.reject(new Axios.CanceledError('Session expired'));
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;
  if (isSessionExpired() && !isPublicPath(window.location.pathname)) {
    return rejectWhileSigningOut();
  }

  const token = await resolveBearerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const locationId = getStoredLocationId();
  if (locationId) config.headers['x-location-id'] = locationId;
  else delete config.headers['x-location-id'];

  const organizationId = getStoredOrganizationId();
  if (organizationId) config.headers['x-organization-id'] = organizationId;

  return config;
});

authClient.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;
  if (isSessionExpired() && !isPublicPath(window.location.pathname)) {
    return rejectWhileSigningOut();
  }
  const token = await resolveBearerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function handleResponseError(error: AxiosError) {
  if (typeof window === 'undefined') return Promise.reject(error);

  const status = error.response?.status;
  if (status === 401) {
    clearAccessToken();
    if (!isPublicPath(window.location.pathname)) void handleSessionExpired();
  }

  // potta-backend answers 403 "You are not assigned to location ..." when x-location-id is stale.
  const message = (error.response?.data as { message?: string } | undefined)?.message ?? '';
  const errorCode = (error.response?.data as { error_code?: string } | undefined)?.error_code;
  if (
    errorCode === 'LOCATION_FORBIDDEN' ||
    errorCode === 'LOCATION_REQUIRED' ||
    (status === 403 && /not assigned to location/i.test(message))
  ) {
    const store = useAuthContextStore.getState();
    const rejected = store.locationId;
    store.resolveAndSetLocation({ preferSelected: false });
    if (useAuthContextStore.getState().locationId === rejected) store.clearLocationId();
  }

  return Promise.reject(error);
}

apiClient.interceptors.response.use((response) => response, handleResponseError);
authClient.interceptors.response.use((response) => response, handleResponseError);

export default apiClient;
