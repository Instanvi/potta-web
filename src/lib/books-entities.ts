import { booksApi, extractBooksRows } from '@/lib/books-api';
import { customerApi } from '@/app/(routes)/customers/utils/api';
import {
  fetchPurchaseOrders,
  getPurchaseOrderDetails,
} from '@/app/(routes)/account_payables/purchase/utils/api';

export type BooksEntityKind =
  | 'customer'
  | 'vendor'
  | 'estimate'
  | 'purchaseOrder'
  | 'salesOrder'
  | 'invoice'
  | 'bill'
  | 'opportunity'
  | 'lead'
  | 'proposal'
  | 'account';

export type BooksEntityOption = { value: string; label: string };

const ENTITY_API_PATH: Partial<Record<BooksEntityKind, string>> = {
  vendor: 'vendor',
  estimate: 'estimate',
  salesOrder: 'sales-order',
  opportunity: 'opportunity',
  lead: 'lead',
  proposal: 'proposal',
  invoice: 'invoice',
  bill: 'bills',
};

function labelFromRow(row: Record<string, unknown>, fallback: string): string {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
  return (
    name ||
    String(
      row.name ??
        row.title ??
        row.code ??
        row.orderNumber ??
        row.invoiceNumber ??
        row.invoiceId ??
        row.billNumber ??
        row.estimateNumber ??
        row.receiptNumber ??
        row.email ??
        row.uuid ??
        fallback
    )
  );
}

/** List org-scoped entity options (relies on axios x-organization-id / x-location-id). */
export async function loadBooksEntityOptions(
  entity: BooksEntityKind
): Promise<BooksEntityOption[]> {
  if (entity === 'customer') {
    const data = await customerApi.getAll({ page: 1, limit: 100 });
    return extractBooksRows(data).map((row) => ({
      value: String(row.uuid ?? ''),
      label: labelFromRow(row, 'Customer'),
    }));
  }

  if (entity === 'purchaseOrder') {
    const data = await fetchPurchaseOrders({
      page: 1,
      limit: 100,
      sortBy: ['createdAt:DESC'],
    });
    return extractBooksRows(data).map((row) => ({
      value: String(row.uuid ?? ''),
      label: `${String(row.orderNumber ?? row.purchaseOrderId ?? row.uuid)} · ${String(
        (row.salePerson as { name?: string } | undefined)?.name ??
          row.status ??
          'PO'
      )}`,
    }));
  }

  if (entity === 'account') {
    // Chart of accounts is org-scoped via location headers on GET tree.
    const { default: axios } = await import('config/axios.config');
    const result = await axios.get('/accounting/accounts/tree');
    const flatten = (nodes: any[], acc: BooksEntityOption[] = []): BooksEntityOption[] => {
      for (const n of nodes ?? []) {
        if (n?.uuid) {
          acc.push({
            value: String(n.uuid),
            label: `${String(n.code ?? '')} ${String(n.name ?? '')}`.trim() || String(n.uuid),
          });
        }
        if (Array.isArray(n?.children) && n.children.length) flatten(n.children, acc);
      }
      return acc;
    };
    const tree = Array.isArray(result?.data) ? result.data : result?.data?.data ?? [];
    return flatten(tree);
  }

  const path = ENTITY_API_PATH[entity];
  if (!path) return [];
  const data = await booksApi.list(path, {}, { page: 1, limit: 100, sortBy: 'createdAt:DESC' });
  return extractBooksRows(data)
    .filter((row) => row.uuid)
    .map((row) => ({
      value: String(row.uuid),
      label: labelFromRow(row, entity),
    }));
}

export type LoadedPurchaseOrderLines = {
  vendorId?: string;
  linesJson: string;
};

/** Map a purchase order's line items into books document `lines` JSON for GRN confirmation. */
export async function loadPurchaseOrderForReceipt(
  purchaseOrderId: string
): Promise<LoadedPurchaseOrderLines> {
  const po = await getPurchaseOrderDetails(purchaseOrderId);
  const vendorId = po?.salePerson?.uuid ? String(po.salePerson.uuid) : undefined;
  const lines = (po?.lineItems ?? []).map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const discountAmount = Number(item.discountAmount) || 0;
    const net = Math.max(0, quantity * unitPrice - discountAmount);
    const taxAmount = Number(((net * taxRate) / 100).toFixed(2));
    const anyItem = item as {
      productId?: string;
      product?: { uuid?: string; name?: string };
    };
    return {
      productId: anyItem.productId || anyItem.product?.uuid,
      description: item.description || anyItem.product?.name || 'Line',
      quantity,
      orderedQuantity: quantity,
      unitPrice,
      taxRate: taxRate || undefined,
      taxAmount: taxAmount || undefined,
      discountAmount: discountAmount || undefined,
      totalAmount: Number((net + taxAmount).toFixed(2)),
    };
  });
  return { vendorId, linesJson: JSON.stringify(lines) };
}

export function downloadBooksPdf(opts: {
  title: string;
  subtitle?: string;
  fields: { label: string; value: string }[];
  lines?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
  }>;
}) {
  const linesHtml = (opts.lines ?? [])
    .map(
      (line) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5">${line.description || '—'}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">${line.quantity ?? ''}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">${line.unitPrice ?? ''}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">${line.totalAmount ?? ''}</td>
        </tr>`
    )
    .join('');

  const fieldsHtml = opts.fields
    .map(
      (f) =>
        `<div style="display:flex;justify-content:space-between;gap:16px;padding:4px 0;font-size:13px">
          <span style="color:#666">${f.label}</span><strong>${f.value || '—'}</strong>
        </div>`
    )
    .join('');

  const html = `<!doctype html><html><head><title>${opts.title}</title>
    <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#666}
    table{width:100%;border-collapse:collapse;margin-top:20px;font-size:13px}th{text-align:left;padding:8px;border-bottom:1px solid #ccc;font-weight:500}</style>
    </head><body>
    <h1>${opts.title}</h1>
    ${opts.subtitle ? `<p>${opts.subtitle}</p>` : ''}
    ${fieldsHtml}
    ${
      opts.lines?.length
        ? `<table><thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${linesHtml}</tbody></table>`
        : ''
    }
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
