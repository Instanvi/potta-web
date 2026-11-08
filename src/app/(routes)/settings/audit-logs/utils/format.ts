import type { AuditLog } from './api';

export const AUDIT_ENTITY_TYPES: { value: string; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'bill', label: 'Bill' },
  { value: 'credit_note', label: 'Credit note' },
  { value: 'purchase_order', label: 'Purchase order' },
  { value: 'sales_receipt', label: 'Sales receipt' },
  { value: 'cashbook_entry', label: 'Cashbook entry' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'product', label: 'Product' },
  { value: 'product_category', label: 'Product category' },
  { value: 'tax', label: 'Tax' },
];

export function entityTypeLabel(entityType: string | null | undefined): string {
  if (!entityType) return '—';
  const known = AUDIT_ENTITY_TYPES.find((t) => t.value === entityType);
  if (known) return known.label;
  const words = entityType.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const METHOD_VERB: Record<string, string> = {
  POST: 'Created',
  PUT: 'Updated',
  PATCH: 'Updated',
  DELETE: 'Deleted',
};

const PAST_TENSE: Record<string, string> = {
  approve: 'Approved',
  approved: 'Approved',
  reject: 'Rejected',
  rejected: 'Rejected',
  void: 'Voided',
  voided: 'Voided',
  pay: 'Paid',
  paid: 'Paid',
  send: 'Sent',
  sent: 'Sent',
  issue: 'Issued',
  issued: 'Issued',
  cancel: 'Cancelled',
  cancelled: 'Cancelled',
  submit: 'Submitted',
  submitted: 'Submitted',
  post: 'Posted',
  posted: 'Posted',
  reverse: 'Reversed',
  reversed: 'Reversed',
  close: 'Closed',
  closed: 'Closed',
  reopen: 'Reopened',
  restock: 'Restocked',
  upload: 'Uploaded',
  import: 'Imported',
  'import-csv': 'Imported CSV for',
  export: 'Exported',
  exported_to_payments: 'Exported to Pay',
  status: 'Changed status of',
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
};

function sentence(words: string): string {
  const s = words.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "PUT /bills/:id/approve" -> "Approved bill"; "bill.approved" -> "Approved bill". */
export function humanizeAction(action: string | null | undefined, entityType?: string | null): string {
  if (!action) return '—';
  const entity = entityTypeLabel(entityType).toLowerCase();

  const http = action.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)/i);
  if (http) {
    const method = http[1].toUpperCase();
    const segments = http[2].split('/').filter((s) => s && !s.startsWith(':'));
    const rest = segments.slice(1);
    if (!rest.length) return `${METHOD_VERB[method] ?? method} ${entity}`;
    const last = rest[rest.length - 1].toLowerCase();
    const verb = PAST_TENSE[last];
    if (verb) return `${verb} ${entity}`;
    return `${METHOD_VERB[method] ?? method} ${entity} · ${sentence(rest.join(' '))}`;
  }

  const dotted = action.split('.');
  if (dotted.length >= 2) {
    const subject = dotted.slice(0, -1).join(' ');
    const event = dotted[dotted.length - 1];
    const verb = PAST_TENSE[event.toLowerCase()];
    return verb ? `${verb} ${sentence(subject).toLowerCase()}` : sentence(`${subject} ${event}`);
  }
  return sentence(action);
}

export function shortId(id: string | null | undefined, size = 8): string {
  if (!id) return '—';
  return id.length > size + 1 ? `${id.slice(0, size)}…` : id;
}

function readStatus(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  const body = v.body && typeof v.body === 'object' ? (v.body as Record<string, unknown>) : undefined;
  const status = v.status ?? v.resultStatus ?? body?.status;
  return typeof status === 'string' && status ? status : undefined;
}

/** Status before -> after when the log carries one. */
export function statusChange(log: Pick<AuditLog, 'before' | 'after'>): { from?: string; to?: string } | null {
  const from = readStatus(log.before);
  const to = readStatus(log.after);
  if (!from && !to) return null;
  if (from && to && from === to) return null;
  return { from, to };
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function prettyJson(value: unknown): string {
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
