'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/config/axios.config';
import { isOrgAdminFromRoles } from '@/lib/org-admin';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { useCan } from '@/components/auth/can';

export type AuthLocation = {
  id: string;
  name: string;
  location_name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export const locationKeys = {
  all: ['auth-locations'] as const,
  org: (orgId: string) => ['auth-locations', orgId] as const,
};

/** Same label rule as instanvi-pay-frontend: Auth returns `location_name`, not `name`. */
export function locationLabel(loc: {
  id: string;
  location_name?: string | null;
  name?: string | null;
}): string {
  return (
    (loc.location_name || loc.name || '').trim() ||
    `Location ${loc.id.slice(0, 6)}`
  );
}

function locationDisplayName(row: Record<string, unknown>, id: string): string {
  const nested = row.location as Record<string, unknown> | null | undefined;
  const candidates = [
    row.location_name,
    row.locationName,
    row.name,
    row.displayName,
    row.title,
    nested?.location_name,
    nested?.locationName,
    nested?.name,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() && c.trim().toLowerCase() !== 'location') {
      return c.trim();
    }
  }
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return id ? `Location ${id.slice(0, 6)}` : 'Unnamed location';
}

async function fetchOrganizationLocations(orgId: string): Promise<AuthLocation[]> {
  const { data } = await authClient.get(`/organizations/${orgId}/locations`);
  const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return rows
    .map((row: Record<string, unknown>) => {
      const id = String(row.id ?? row.uuid ?? '');
      const location_name =
        typeof row.location_name === 'string' ? row.location_name : null;
      return {
        id,
        location_name,
        name: locationDisplayName(row, id),
        address: (row.address as string | null | undefined) ?? null,
        phone: (row.phone as string | null | undefined) ?? null,
        email: (row.email as string | null | undefined) ?? null,
      };
    })
    .filter((l: AuthLocation) => Boolean(l.id));
}

/**
 * Full org location list from Auth (not just the session assignment).
 * Enabled for org admins / owners, or when the caller already has location-manage style access.
 */
export function useOrganizationLocations(orgId?: string | null) {
  const storeOrgId = useAuthContextStore((s) => s.organizationId);
  const roleNames = useAuthContextStore((s) => s.roleNames);
  const roles = useAuthContextStore((s) => s.roles);
  const { canAccess } = useCan();
  const id = orgId ?? storeOrgId;
  const canListAll =
    isOrgAdminFromRoles(roleNames, roles) ||
    canAccess('Location', 'view-all') ||
    canAccess('Location', 'view') ||
    canAccess('Organization', 'update');

  return useQuery({
    queryKey: locationKeys.org(id ?? ''),
    queryFn: () => fetchOrganizationLocations(id!),
    enabled: Boolean(id) && canListAll,
    staleTime: 5 * 60 * 1000,
  });
}
