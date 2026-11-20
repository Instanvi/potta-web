'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { authService } from '@/lib/services/auth';
import { clearAccessToken } from '@/lib/access-token';
import { useAuthContextStore } from '@/store/use-auth-context-store';

/**
 * 1) POST /auth/sign-out on the IdP (server session invalidation).
 * 2) Reset the persisted auth context (org, location, permissions).
 * 3) next-auth signOut, then back to the Instanvi hub.
 */
export async function signOutWithAuthApi() {
  try {
    await authService.logout();
  } catch {
    // Still clear the local session if the IdP is unreachable
  }
  clearAccessToken();
  useAuthContextStore.getState().clear();
  await nextAuthSignOut({ redirect: false });
  window.location.replace(process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com');
}
