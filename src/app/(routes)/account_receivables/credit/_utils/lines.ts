import { CreditNoteLineItem } from './types';

/** Row shape written to `context.data.table` by ProductLinesTable. */
export interface CreditNoteTableRow {
  uuid?: string;
  name?: string;
  qty?: number | string;
  price?: number | string;
  tax?: number | string;
  isCustom?: boolean;
}

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
