import type { SaleLineItem } from './sale';
import { computeTotals } from './sale';

export const HELD_ORDERS_KEY = 'heldOrders';
export const HELD_ORDERS_EVENT = 'potta-held-orders-changed';

export type HeldOrder = {
  id: string;
  items: SaleLineItem[];
  timestamp: string;
  total: number;
};

export function readHeldOrders(): HeldOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HELD_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHeldOrders(orders: HeldOrder[]) {
  localStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(HELD_ORDERS_EVENT));
}

export function nextHeldOrderId(existing: HeldOrder[] = readHeldOrders()): string {
  // Use RegExp ctor (not a /[-:TZ.]/ literal) so Tailwind content scan won't treat it as a class.
  const stamp = new Date()
    .toISOString()
    .replace(new RegExp('[-:TZ.]', 'g'), '')
    .slice(0, 14);
  if (!existing.some((o) => o.id === stamp)) return stamp;
  return `${stamp}${Math.floor(Math.random() * 90 + 10)}`;
}

export function buildHeldOrder(items: SaleLineItem[], id?: string): HeldOrder {
  const totals = computeTotals(items, 0);
  return {
    id: id ?? nextHeldOrderId(),
    items,
    timestamp: new Date().toISOString(),
    total: totals.total,
  };
}

export function subscribeHeldOrders(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(HELD_ORDERS_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(HELD_ORDERS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
