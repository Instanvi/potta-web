import { booksApi, extractBooksRows } from '@/lib/books-api';
import type { PdfSeller } from '@/lib/org-to-seller';
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
export async function downloadBooksPdf(opts: {
  title: string;
  subtitle?: string;
  fields: { label: string; value: string }[];
  lines?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
  }>;
  /** Org letterhead; pass `orgToSeller(org)` from the caller. */
  seller?: PdfSeller;
  currency?: string;
}) {
  const [{ createElement }, { downloadReactPdf }, { GenericDocumentPdf }] =
    await Promise.all([
      import('react'),
      import('@/lib/download-react-pdf'),
      import('@/components/documents/generic-document-pdf'),
    ]);

  const element = createElement(GenericDocumentPdf, {
    title: opts.title,
    subtitle: opts.subtitle,
    fields: opts.fields,
    lines: opts.lines,
    currency: opts.currency,
    seller: opts.seller ?? { name: 'Your organization' },
  });
  await downloadReactPdf(element, opts.title || 'document');
}
