'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { authClient } from '@/config/axios.config';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { isOrgAdminFromRoles } from '@/lib/org-admin';
import type {
  GetSessionResponse,
  SessionHierarchyResponse,
  SessionPermissionsResponse,
} from '@/types/auth';

function unwrapData<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null;
  const boxed = payload as { data?: T };
  if (boxed.data && typeof boxed.data === 'object') return boxed.data;
  return payload as T;
}

async function fetchAddon<T>(path: string): Promise<T | null> {
  try {
    const response = await authClient.get<T | { data?: T }>(path);
    return unwrapData<T>(response.data);
  } catch {
    return null;
  }
}

/**
 * Same flow as the other Instanvi apps:
 * POST /get-session -> GET /session/permissions + GET /session/hierarchy (location).
 * Throws when /get-session fails so callers can retry.
 */
export async function hydrateAuthContext(): Promise<void> {
  const store = useAuthContextStore.getState();
  const slimRes = await authClient.post<GetSessionResponse | { data?: GetSessionResponse }>('/get-session', {});
  const slim = unwrapData<GetSessionResponse>(slimRes.data);
  if (!slim) throw new Error('Empty session response');
  store.hydrateFromSlimSession(slim);

  if (slim.activeOrganizationId ?? slim.organization?.id) {
    const [perms, hierarchy] = await Promise.all([
      fetchAddon<SessionPermissionsResponse>('/session/permissions'),
      fetchAddon<SessionHierarchyResponse>('/session/hierarchy'),
    ]);
    if (perms?.roles) store.hydrateFromPermissions(perms);
    if (hierarchy) store.hydrateFromHierarchy(hierarchy);
  }
  store.setSessionReady(true);
}

/** Re-hydrates on load when the persisted context is missing org, permissions or location. */
export function AuthContextHydrator() {
  const { status } = useSession();
  const hasHydrated = useAuthContextStore((s) => s._hasHydrated);
  const sessionReady = useAuthContextStore((s) => s.sessionReady);
  const organizationId = useAuthContextStore((s) => s.organizationId);
  const locationId = useAuthContextStore((s) => s.locationId);
  const permissions = useAuthContextStore((s) => s.permissions);
  const roleNames = useAuthContextStore((s) => s.roleNames);
  const roles = useAuthContextStore((s) => s.roles);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || status !== 'authenticated' || startedRef.current) return;

    const hasPermissions = Object.keys(permissions).length > 0;
    const locationOk = !!locationId || isOrgAdminFromRoles(roleNames, roles);
    if (organizationId && hasPermissions && locationOk) {
      if (!sessionReady) useAuthContextStore.getState().setSessionReady(true);
      return;
    }

    startedRef.current = true;
    hydrateAuthContext().catch(() => {
      startedRef.current = false;
    });
  }, [hasHydrated, status, sessionReady, organizationId, locationId, permissions, roleNames, roles]);

  return null;
}
