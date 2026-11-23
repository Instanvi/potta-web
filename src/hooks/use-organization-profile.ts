'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/config/axios.config';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import type { OrganizationProfile } from '@/types/auth';

export const orgKeys = {
  all: ['organization'] as const,
  detail: (id: string) => ['organization', 'detail', id] as const,
};

async function fetchOrganizationProfile(id: string): Promise<OrganizationProfile> {
  const { data } = await authClient.get<OrganizationProfile>(`/organizations/${id}`);
  return data;
}

/** Full Auth org (logo, address, tax, phone) for document seller branding. */
export function useOrganizationProfile(orgId?: string | null) {
  const storeOrgId = useAuthContextStore((s) => s.organizationId);
  const id = orgId ?? storeOrgId;

  return useQuery({
    queryKey: orgKeys.detail(id ?? ''),
    queryFn: () => fetchOrganizationProfile(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function formatOrgAddress(org?: OrganizationProfile | null): string[] {
  if (!org) return [];
  const lines: string[] = [];
  if (org.addressLine1) lines.push(org.addressLine1);
  if (org.addressLine2) lines.push(org.addressLine2);
  const cityLine = [org.city, org.state || org.province, org.postalCode]
    .filter(Boolean)
    .join(', ');
  if (cityLine) lines.push(cityLine);
  if (org.country) lines.push(org.country);
  return lines;
}

export function orgDisplayName(org?: OrganizationProfile | null): string {
  if (!org) return '';
  return (org.businessName || org.tradeName || org.name || '').trim();
}
