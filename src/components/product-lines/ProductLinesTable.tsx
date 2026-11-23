'use client';

import { useContext, useMemo } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  DocumentLine,
  DocumentLinesEditor,
  DEFAULT_LINE_TAX_RATE,
} from '@potta/components/product-lines/DocumentLinesEditor';

const getCurrencySymbol = (currencyCode: string): string => {
  if (currencyCode === 'USD') return '$';
  if (currencyCode === 'EUR') return '€';
  if (currencyCode === 'GBP') return '£';
  return currencyCode || 'XAF';
};

type TableRow = {
  id: number;
  uuid: string;
  productId: string;
  name: string;
  qty: number;
  price: number;
  tax: number;
  variationId?: string | null;
  packagePriceId?: string | null;
  unitId?: string | null;
  modifierIds?: string[];
  lineKey: string;
  isCustom?: boolean;
};

function rowsToLines(rows: TableRow[]): DocumentLine[] {
  return rows.map((r) => ({
    productId: r.isCustom ? undefined : r.uuid || undefined,
    description: r.name ?? '',
    quantity: Number(r.qty) || 0,
    unitPrice: Number(r.price) || 0,
    taxRate: Number(r.tax) || 0,
    variationId: r.variationId || undefined,
    packagePriceId: r.packagePriceId || undefined,
    unitId: r.unitId || undefined,
  }));
}

function linesToRows(lines: DocumentLine[], prev: TableRow[]): TableRow[] {
  return lines.map((line, index) => {
    const prevRow = prev[index];
    const isCustom = !line.productId;
    const uuid = line.productId || prevRow?.uuid || `custom-${Date.now()}-${index}`;
    const name = line.description || '';
    const lineKey =
      prevRow?.lineKey && prevRow.uuid === uuid
        ? prevRow.lineKey
        : isCustom
          ? `custom-${name}-${line.unitPrice}-${index}`
          : `product-${uuid}-${index}`;
    return {
      id: index + 1,
      uuid,
      productId: isCustom ? '' : (prevRow?.productId || uuid),
      name,
      qty: Number(line.quantity) || 0,
      price: Number(line.unitPrice) || 0,
      tax: Number(line.taxRate) || 0,
      variationId: line.variationId ?? prevRow?.variationId ?? null,
      packagePriceId: line.packagePriceId ?? prevRow?.packagePriceId ?? null,
      unitId: line.unitId ?? prevRow?.unitId ?? null,
      modifierIds: prevRow?.modifierIds,
      lineKey,
      isCustom,
    };
  });
}

export default function ProductLinesTable() {
  const context = useContext(ContextData);
  const rows: TableRow[] = context?.data?.table || [];
  const currency = context?.data?.currency || 'XAF';
  const currencySymbol = getCurrencySymbol(currency);

  const lines = useMemo(() => rowsToLines(rows), [rows]);

  const persist = (nextLines: DocumentLine[]) => {
    const updated = linesToRows(nextLines, rows);
    context?.setData((prev: { table?: TableRow[] } & Record<string, unknown>) => ({
      ...prev,
      table: updated,
    }));
  };

  const subtotal = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const taxAmount = rows.reduce((s, r) => s + (r.qty * r.price * r.tax) / 100, 0);
  const money = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-5">
      <DocumentLinesEditor
        lines={lines}
        onChange={persist}
        defaultTaxRate={DEFAULT_LINE_TAX_RATE}
      />

      <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums text-foreground">
            {currencySymbol} {money(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="tabular-nums text-foreground">
            {currencySymbol} {money(taxAmount)}
          </span>
        </div>
        <div className="flex justify-between border-t border-black/[0.08] pt-2 text-base font-medium text-foreground">
          <span>Total</span>
          <span className="tabular-nums">
            {currencySymbol} {money(subtotal + taxAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

export const catalogLinePayload = (row: TableRow) => ({
  productId: row.isCustom ? undefined : row.uuid,
  variationId: row.variationId || undefined,
  packagePriceId: row.packagePriceId || undefined,
  unitId: row.unitId || undefined,
  modifierIds: row.modifierIds,
  quantity: row.qty,
  unitPrice: row.price,
  description: row.name,
});
