'use client';

import { useMemo } from 'react';
import { Button } from '@/components/shadcn/button';
import SearchableSelect from '@/components/searchableSelect';
import { SHEET_FIELD_INPUT, SHEET_FIELD_LABEL } from '@/lib/field-styles';
import useGetAllProducts from '@potta/app/(routes)/pos/inventory/_hooks/useGetAllProducts';
import type { Product } from '@potta/app/(routes)/pos/inventory/_utils/types';

export type BooksDocumentLine = {
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
};

const emptyLine = (): BooksDocumentLine => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
});

function parseLines(raw: string): BooksDocumentLine[] {
  if (!raw.trim()) return [emptyLine()];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [emptyLine()];
    return parsed.map((row) => ({
      productId: row?.productId ? String(row.productId) : undefined,
      description: row?.description != null ? String(row.description) : '',
      quantity: Number(row?.quantity) || 0,
      unitPrice: Number(row?.unitPrice) || 0,
      taxRate: Number(row?.taxRate) || 0,
      taxAmount: Number(row?.taxAmount) || 0,
      discountAmount: Number(row?.discountAmount) || 0,
      totalAmount: Number(row?.totalAmount) || 0,
    }));
  } catch {
    return [emptyLine()];
  }
}

function serializeLines(lines: BooksDocumentLine[]): string {
  const cleaned = lines
    .map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      const taxRate = Number(line.taxRate) || 0;
      const discountAmount = Number(line.discountAmount) || 0;
      const net = Math.max(0, quantity * unitPrice - discountAmount);
      const taxAmount = Number(((net * taxRate) / 100).toFixed(2));
      const totalAmount = Number((net + taxAmount).toFixed(2));
      const out: BooksDocumentLine = {
        description: line.description?.trim() || undefined,
        quantity,
        unitPrice,
        taxRate: taxRate || undefined,
        taxAmount: taxAmount || undefined,
        discountAmount: discountAmount || undefined,
        totalAmount,
      };
      if (line.productId) out.productId = line.productId;
      return out;
    })
    .filter((line) => line.description || line.productId || line.quantity > 0);
  return JSON.stringify(cleaned);
}

export function BooksLinesEditor({
  label = 'Line items',
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const lines = useMemo(() => parseLines(value), [value]);
  const { data } = useGetAllProducts({ page: 1, limit: 100 });
  const products: Product[] = data?.data ?? [];
  const productOptions = products.map((p) => ({
    value: p.uuid,
    label: p.name,
  }));

  const update = (next: BooksDocumentLine[]) => onChange(serializeLines(next));

  const setLine = (index: number, patch: Partial<BooksDocumentLine>) => {
    const next = lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    update(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={SHEET_FIELD_LABEL}>{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => update([...lines, emptyLine()])}
        >
          Add line
        </Button>
      </div>

      <div className="space-y-3 rounded-[2px] border border-black/[0.08] bg-white p-3">
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-2 border-b border-black/[0.06] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-12"
          >
            <div className="sm:col-span-5">
              <SearchableSelect
                label="Product / service"
                options={productOptions}
                selectedValue={line.productId || ''}
                placeholder="Select or type description below"
                onChange={(productId) => {
                  const product = products.find((p) => p.uuid === productId);
                  setLine(index, {
                    productId: productId || undefined,
                    description: product?.name || line.description,
                    unitPrice:
                      product?.salesPrice != null
                        ? Number(product.salesPrice)
                        : line.unitPrice,
                  });
                }}
              />
              <input
                type="text"
                value={line.description || ''}
                onChange={(e) => setLine(index, { description: e.target.value })}
                className={`${SHEET_FIELD_INPUT} mt-2`}
                placeholder="Description"
              />
            </div>
            <label className="sm:col-span-2">
              <span className={SHEET_FIELD_LABEL}>Qty</span>
              <input
                type="number"
                min={0}
                step="any"
                value={line.quantity}
                onChange={(e) => setLine(index, { quantity: Number(e.target.value) || 0 })}
                className={SHEET_FIELD_INPUT}
              />
            </label>
            <label className="sm:col-span-2">
              <span className={SHEET_FIELD_LABEL}>Price</span>
              <input
                type="number"
                min={0}
                step="any"
                value={line.unitPrice}
                onChange={(e) => setLine(index, { unitPrice: Number(e.target.value) || 0 })}
                className={SHEET_FIELD_INPUT}
              />
            </label>
            <label className="sm:col-span-2">
              <span className={SHEET_FIELD_LABEL}>Tax %</span>
              <input
                type="number"
                min={0}
                step="any"
                value={line.taxRate || 0}
                onChange={(e) => setLine(index, { taxRate: Number(e.target.value) || 0 })}
                className={SHEET_FIELD_INPUT}
              />
            </label>
            <div className="flex items-end sm:col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => update(lines.filter((_, i) => i !== index))}
                disabled={lines.length <= 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
