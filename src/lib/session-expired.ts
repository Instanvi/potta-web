import { signOut } from 'next-auth/react';
import { clearAccessToken } from '@/lib/access-token';
import { useAuthContextStore } from '@/store/use-auth-context-store';

const SIGN_OUT_TIMEOUT_MS = 3000;

let expired = false;

/** True once a 401 has started the expiry flow; API calls should stop. */
export function isSessionExpired(): boolean {
  return expired;
}

/**
 * The hub must receive `logout=1`: without it a still-alive hub session hands
 * the same expired token straight back to /auth-callback and the page loops.
 */
export function buildHubLoginUrl(options: { logout?: boolean } = {}): string {
  const superAppUrl = process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com';
  const returnPath = `${window.location.pathname}${window.location.search}`;
  const callbackUrl = `${window.location.origin}/auth-callback?callbackUrl=${encodeURIComponent(returnPath)}`;
  const url = new URL('/login', superAppUrl);
  if (options.logout) url.searchParams.set('logout', '1');
  url.searchParams.set('callbackUrl', callbackUrl);
  url.searchParams.set('desktop', 'true');
  return url.toString();
}

/** Runs once per page load no matter how many requests fail with 401. */
export async function handleSessionExpired(): Promise<void> {
  if (typeof window === 'undefined' || expired) return;
  expired = true;

  clearAccessToken();
  try {
    useAuthContextStore.getState().clear();
  } catch {
    // storage blocked; the redirect below still ends the session
  }

  try {
    await Promise.race([
      signOut({ redirect: false }),
      new Promise((resolve) => setTimeout(resolve, SIGN_OUT_TIMEOUT_MS)),
    ]);
  } catch {
    // continue to the hard redirect
  }

  window.location.replace(buildHubLoginUrl({ logout: true }));
}
