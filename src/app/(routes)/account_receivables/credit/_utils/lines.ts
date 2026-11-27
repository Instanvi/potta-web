import { CreditNoteLineItem } from './types';

/** Row shape written to `context.data.table` by ProductLinesTable. */
export interface CreditNoteTableRow {
  id?: number;
  uuid?: string;
  productId?: string;
  name?: string;
  qty?: number | string;
  price?: number | string;
  tax?: number | string;
  lineKey?: string;
  isCustom?: boolean;
  variationId?: string | null;
  packagePriceId?: string | null;
  unitId?: string | null;
}

/** Loose invoice line from `GET /invoice/details/:id` (with optional product join). */
export type InvoiceLineLike = {
  description?: string | null;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  taxRate?: number | string | null;
  productId?: string | null;
  product?: { uuid?: string; name?: string; productName?: string } | null;
  variationUuid?: string | null;
  packagePriceUuid?: string | null;
  unitUuid?: string | null;
};

/** Copy invoice lines into the credit-note product table (user can edit after). */
export const invoiceLinesToTableRows = (
  lines: InvoiceLineLike[] = [],
): CreditNoteTableRow[] =>
  lines
    .map((line, index) => {
      const productId =
        line.product?.uuid ||
        (typeof line.productId === 'string' ? line.productId : '') ||
        '';
      const name =
        line.description?.trim() ||
        line.product?.name?.trim() ||
        line.product?.productName?.trim() ||
        '';
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      if (qty <= 0 && price <= 0) return null;
      const isCustom = !productId;
      const uuid = productId || `custom-invoice-${index}`;
      return {
        id: index + 1,
        uuid,
        productId: isCustom ? '' : productId,
        name: name || (isCustom ? 'Line from invoice' : 'Product'),
        qty: qty > 0 ? qty : 1,
        price,
        tax: Number(line.taxRate) || 0,
        variationId: line.variationUuid ?? null,
        packagePriceId: line.packagePriceUuid ?? null,
        unitId: line.unitUuid ?? null,
        lineKey: isCustom
          ? `custom-invoice-${index}`
          : `product-${uuid}-${index}`,
        isCustom,
      } satisfies CreditNoteTableRow;
    })
    .filter((row): row is CreditNoteTableRow => row !== null);

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const rowTotal = (row: CreditNoteTableRow) => {
  const base = Number(row.qty || 0) * Number(row.price || 0);
  return round2(base + (base * Number(row.tax || 0)) / 100);
};

/** Sum of line totals (tax included), same maths as the invoice form totals. */
export const computeCreditAmount = (rows: CreditNoteTableRow[] = []) =>
  round2(rows.reduce((sum, row) => sum + rowTotal(row), 0));

/** Serialize table rows for the `lineItems` jsonb column; blank rows are skipped. */
export const serializeLineItems = (
  rows: CreditNoteTableRow[] = []
): CreditNoteLineItem[] =>
  rows
    .filter((row) => Number(row.qty || 0) > 0 && Number(row.price || 0) > 0)
    .map((row) => {
      const item: CreditNoteLineItem = {
        description: row.name ?? '',
        quantity: Number(row.qty) || 0,
        unitPrice: Number(row.price) || 0,
        taxRate: Number(row.tax) || 0,
        total: rowTotal(row),
      };
      if (row.uuid && !row.isCustom && !String(row.uuid).startsWith('custom-')) {
        item.productId = row.uuid;
      }
      return item;
    });
