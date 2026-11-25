import type { OrganizationProfile } from '@/types/auth';

/** Map common ISO country names/codes to E.164 calling codes for PhoneInput. */
const COUNTRY_TO_CALLING: Record<string, string> = {
  CM: '+237',
  Cameroon: '+237',
  NG: '+234',
  Nigeria: '+234',
  GH: '+233',
  Ghana: '+233',
  KE: '+254',
  Kenya: '+254',
  ZA: '+27',
  'South Africa': '+27',
  FR: '+33',
  France: '+33',
  US: '+1',
  'United States': '+1',
  CA: '+1',
  Canada: '+1',
  GB: '+44',
  'United Kingdom': '+44',
  UK: '+44',
};

/** Prefer org country for phone default; fall back to Cameroon (+237). */
export function orgDefaultCallingCode(
  org?: OrganizationProfile | null,
  fallback = '+237',
): string {
  const country = (org?.country || '').trim();
  if (!country) return fallback;
  return COUNTRY_TO_CALLING[country] || COUNTRY_TO_CALLING[country.toUpperCase()] || fallback;
}
