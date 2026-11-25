import {
  formatOrgAddress,
  orgDisplayName,
} from '@/hooks/use-organization-profile';
import type { OrganizationProfile } from '@/types/auth';

/** Seller / letterhead identity shared by every react-pdf document. */
export type PdfSeller = {
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLines?: string[];
  logoUrl?: string | null;
  registrationNumber?: string | null;
  taxId?: string | null;
};

export const DEFAULT_SELLER_NAME = 'Your organization';

/** Map the Auth organization profile to the seller block used on PDFs. */
export function orgToSeller(
  org?: OrganizationProfile | null,
  fallbackName: string = DEFAULT_SELLER_NAME,
): PdfSeller {
  return {
    name: orgDisplayName(org) || fallbackName,
    email: org?.businessEmail ?? null,
    phone: org?.businessPhone ?? null,
    addressLines: formatOrgAddress(org),
    logoUrl: org?.logo ?? null,
    registrationNumber: org?.registrationNumber ?? null,
    taxId: org?.taxIdentificationNumber ?? null,
  };
}
