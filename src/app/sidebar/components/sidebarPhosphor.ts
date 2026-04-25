/** Default size for react-pro-sidebar menu icons */
export const SB_ICON = 22;

export function sbWeight(active: boolean): 'fill' | 'regular' {
  return active ? 'fill' : 'regular';
}

export function sbClass(active: boolean): string {
  return active ? 'text-white' : 'text-black';
}
