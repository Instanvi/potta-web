'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePaymentMethods } from '@/app/(routes)/accounting/payment-methods/hooks';
import {
  loadBooksEntityOptions,
  type BooksEntityKind,
} from '@/lib/books-entities';
import { paymentMethodDisplayLabel } from '@/lib/payment-method-labels';
import { cellValue } from '@/lib/books-api';

const FIELD_TYPES = new Set<BooksEntityKind>([
  'customer',
  'vendor',
  'invoice',
  'bill',
  'purchaseOrder',
  'salesOrder',
  'estimate',
  'proposal',
  'opportunity',
  'account',
]);

const KEY_TO_FIELD_TYPE: Record<string, string> = {
  customerId: 'customer',
  vendorId: 'vendor',
  invoiceId: 'invoice',
  billId: 'bill',
  purchaseOrderId: 'purchaseOrder',
  salesOrderId: 'salesOrder',
  estimateId: 'estimate',
  proposalId: 'proposal',
  opportunityId: 'opportunity',
  accountId: 'account',
  paymentMethod: 'paymentMethod',
  method: 'paymentMethod',
  refundMethod: 'paymentMethod',
};

export type BooksLabelColumn = { key: string; type?: string };

/** Infer the lookup type for a column/form key (customerId → customer, etc.). */
export function inferBooksLabelType(key: string, explicit?: string): string | undefined {
  if (explicit && explicit !== 'text' && explicit !== 'number' && explicit !== 'select') {
    return explicit;
  }
  return KEY_TO_FIELD_TYPE[key];
}

/**
 * Loads id→label maps for party/document/payment fields used on a books page,
 * so list tables and exports show names instead of bare UUIDs/codes.
 */
export function useBooksLabelMaps(
  columns: BooksLabelColumn[],
  fields: BooksLabelColumn[] = [],
) {
  const neededTypes = useMemo(() => {
    const set = new Set<string>();
    for (const item of [...columns, ...fields]) {
      const t = inferBooksLabelType(item.key, item.type);
      if (t) set.add(t);
    }
    return set;
  }, [columns, fields]);

  const { data: paymentData } = usePaymentMethods({ page: 1, limit: 100 });

  const kindsToLoad = useMemo(() => {
    const kinds: BooksEntityKind[] = [];
    for (const t of neededTypes) {
      if (FIELD_TYPES.has(t as BooksEntityKind)) kinds.push(t as BooksEntityKind);
    }
    return kinds;
  }, [neededTypes]);

  const kindsKey = kindsToLoad.join('|');
  const [maps, setMaps] = useState<Partial<Record<BooksEntityKind, Map<string, string>>>>({});

  useEffect(() => {
    if (!kindsToLoad.length) {
      setMaps({});
      return;
    }
    let cancelled = false;
    (async () => {
      const next: Partial<Record<BooksEntityKind, Map<string, string>>> = {};
      await Promise.all(
        kindsToLoad.map(async (kind) => {
          try {
            const options = await loadBooksEntityOptions(kind);
            next[kind] = new Map(options.map((o) => [o.value, o.label]));
          } catch {
            next[kind] = new Map();
          }
        }),
      );
      if (!cancelled) setMaps(next);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kindsKey captures kindsToLoad
  }, [kindsKey]);

  const orgMethods = useMemo(
    () => (paymentData?.data ?? []).map((m) => ({ code: m.code, name: m.name })),
    [paymentData?.data],
  );

  const formatCell = useMemo(() => {
    return (row: Record<string, unknown>, key: string, type?: string): string => {
      const raw = cellValue(row, key);
      if (raw === '—') return raw;
      const labelType = inferBooksLabelType(key, type);
      if (!labelType) return raw;

      if (labelType === 'paymentMethod') {
        return paymentMethodDisplayLabel(raw, orgMethods);
      }

      const entity = labelType as BooksEntityKind;
      const map = maps[entity];
      if (map?.has(raw)) return map.get(raw) as string;

      if (key === 'customerId' && row.customer && typeof row.customer === 'object') {
        const c = row.customer as Record<string, unknown>;
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
        if (name) return name;
        if (c.name) return String(c.name);
      }
      if (key === 'vendorId' && row.vendor && typeof row.vendor === 'object') {
        const v = row.vendor as Record<string, unknown>;
        if (v.name) return String(v.name);
      }
      return raw;
    };
  }, [maps, orgMethods]);

  return { formatCell, orgMethods };
}
