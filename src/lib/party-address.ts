/** Format a nested customer/vendor address object into one or more display lines. */
export function formatPartyAddress(address?: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
} | null): string {
  if (!address) return '';
  const lines = [
    (address.address || '').trim(),
    [address.city, address.state, address.postalCode].filter(Boolean).join(', ').trim(),
    (address.country || '').trim(),
  ].filter(Boolean);
  return lines.join('\n');
}

export function formatPartyAddressLines(address?: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
} | null): string[] {
  const text = formatPartyAddress(address);
  return text ? text.split('\n') : [];
}
