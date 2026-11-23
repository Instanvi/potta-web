'use client';

import {
  DocumentLine,
  DocumentLinesEditor,
  emptyDocumentLine,
} from '@potta/components/product-lines/DocumentLinesEditor';

export type BooksDocumentLine = {
  productId?: string;
  description?: string;
  quantity: number;
  orderedQuantity?: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  variationId?: string;
  packagePriceId?: string;
  unitId?: string;
};

function parseLines(raw: string): DocumentLine[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed.map((row) => ({
      productId: row?.productId ? String(row.productId) : undefined,
      description: row?.description != null ? String(row.description) : '',
      quantity: Number(row?.quantity) || 0,
      orderedQuantity:
        row?.orderedQuantity != null ? Number(row.orderedQuantity) : undefined,
      unitPrice: Number(row?.unitPrice) || 0,
      taxRate: Number(row?.taxRate) || 0,
      discountAmount: Number(row?.discountAmount) || 0,
      variationId: row?.variationId ? String(row.variationId) : undefined,
      packagePriceId: row?.packagePriceId ? String(row.packagePriceId) : undefined,
      unitId: row?.unitId ? String(row.unitId) : undefined,
    }));
  } catch {
    return [];
  }
}

function serializeLines(lines: DocumentLine[]): string {
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
      if (line.orderedQuantity != null) out.orderedQuantity = line.orderedQuantity;
      if (line.variationId) out.variationId = line.variationId;
      if (line.packagePriceId) out.packagePriceId = line.packagePriceId;
      if (line.unitId) out.unitId = line.unitId;
      return out;
    })
    .filter((line) => line.description || line.productId || line.quantity > 0);
  return JSON.stringify(cleaned);
}

export function BooksLinesEditor({
  label = 'Line items',
  value,
  onChange,
  confirmQuantities = false,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  confirmQuantities?: boolean;
}) {
  const lines = parseLines(value);

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
      <DocumentLinesEditor
        lines={lines.length > 0 ? lines : []}
        confirmQuantities={confirmQuantities}
        onChange={(next) => onChange(serializeLines(next))}
        defaultTaxRate={0}
      />
    </div>
  );
}

export { emptyDocumentLine as emptyBooksLine };
