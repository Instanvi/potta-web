/** Default Potta mark when an organization has not uploaded a logo. */
export const POTTA_LOGO_SVG = '/images/pottaLogo.svg';
export const POTTA_LOGO_PNG = '/images/potta-logo.png';
export const INSTANVI_LOGO_SVG = '/instanvi_logo_full.svg';
export const INSTANVI_ICON_SVG = '/icons/instanvi.svg';

export type DocumentLetterheadLogo = 'org' | 'potta' | 'instanvi' | 'none';

/** Prefer org logo; otherwise the Potta brand mark (SVG for UI, PNG for PDF/print). */
export function orgLogoOrPotta(
  logo?: string | null,
  format: 'svg' | 'png' = 'svg',
): string {
  const trimmed = typeof logo === 'string' ? logo.trim() : '';
  if (trimmed) return trimmed;
  return format === 'png' ? POTTA_LOGO_PNG : POTTA_LOGO_SVG;
}

/** Resolve letterhead logo from user choice + org profile. */
export function resolveLetterheadLogoUrl(
  choice: DocumentLetterheadLogo,
  orgLogo?: string | null,
  format: 'svg' | 'png' = 'svg',
): string | null {
  if (choice === 'none') return null;
  if (choice === 'potta') return format === 'png' ? POTTA_LOGO_PNG : POTTA_LOGO_SVG;
  if (choice === 'instanvi') return INSTANVI_LOGO_SVG;
  return orgLogoOrPotta(orgLogo, format);
}

/** Absolute URL for @react-pdf / print iframes (needs a fetchable http(s) or same-origin URL). */
export function absoluteBrandUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('data:')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}

/** Logo URL suitable for react-pdf Image (raster preferred). */
export function resolvePdfLogoUrl(logo?: string | null): string {
  const src = orgLogoOrPotta(logo, 'png');
  // react-pdf Image handles http(s) and data URIs best; skip exotic relative-only in SSR.
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return absoluteBrandUrl(src);
}
