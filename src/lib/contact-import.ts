/** Templates and CSV payloads for customer and vendor import. */

import { apiOptionalText, apiPaymentTerms } from '@/lib/document-api-fields';

export type ContactImportKind = 'customer' | 'vendor';

const CUSTOMER_HEADERS = [
  'firstName',
  'lastName',
  'type',
  'email',
  'phone',
  'gender',
  'contactPerson',
  'creditLimit',
  'taxId',
  'date_of_birth',
  'address',
  'city',
  'state',
  'country',
  'postalCode',
];

const VENDOR_HEADERS = [
  'name',
  'type',
  'email',
  'phone',
  'contactPerson',
  'currency',
  'classification',
  'industry',
  'paymentTerms',
  'website',
  'taxId',
  'creditLimit',
  'openingBalance',
  'notes',
  'address',
  'city',
  'state',
  'country',
  'postalCode',
];

const CUSTOMER_SAMPLE = [
  'Jane',
  'Doe',
  'INDIVIDUAL',
  'jane.doe@example.com',
  '+237677000000',
  'female',
  'Jane Doe',
  '0',
  '',
  '1990-01-01',
  '12 Main St',
  'Douala',
  'Littoral',
  'Cameroon',
  '00237',
];

const VENDOR_SAMPLE = [
  'Acme Supplies',
  'company',
  'ap@acme.com',
  '+237677000001',
  'Ada Lovelace',
  'XAF',
  'Supplier',
  'Retail',
  'Net 30',
  '',
  '',
  '0',
  '0',
  '',
  '45 Industrial Zone',
  'Douala',
  'Littoral',
  'Cameroon',
  '',
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: string[][]) {
  return rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
}

export async function downloadContactTemplate(kind: ContactImportKind, format: 'csv' | 'xlsx') {
  const headers = kind === 'customer' ? CUSTOMER_HEADERS : VENDOR_HEADERS;
  const sample = kind === 'customer' ? CUSTOMER_SAMPLE : VENDOR_SAMPLE;
  const rows = [headers, sample];
  const base = kind === 'customer' ? 'customers-template' : 'vendors-template';

  if (format === 'csv') {
    downloadBlob(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), `${base}.csv`);
    return;
  }

  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Contacts');
  const buf = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${base}.xlsx`
  );
}

function cellText(value: unknown) {
  if (value == null) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

export async function readSpreadsheet(file: File): Promise<Record<string, string>[]> {
  const XLSX = await import('xlsx');
  const book = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) return [];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: true,
  });
  return records.map((record) => {
    const row: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      row[key.trim()] = cellText(value);
    }
    return row;
  });
}

const CUSTOMER_TYPES = new Set(['INDIVIDUAL', 'COMPANY']);
const VENDOR_TYPES = new Set(['individual', 'company']);
const CURRENCIES = new Set(['EUR', 'USD', 'XAF']);
const CLASSIFICATIONS = new Set(['Supplier', 'Service Provider']);

function idFor(prefix: string, index: number) {
  return `${prefix}${Date.now()}${index}`;
}

function addressJson(row: Record<string, string>) {
  const address = {
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || '',
    postalCode: row.postalCode || '',
  };
  if (!Object.values(address).some(Boolean)) return '';
  return JSON.stringify({ ...address, latitude: 0, longitude: 0 });
}

export type PreparedImport = {
  files: File[];
  errors: string[];
};

function groupFiles(name: string, rows: Record<string, string>[]): File[] {
  const groups = new Map<string, Record<string, string>[]>();
  rows.forEach((row) => {
    const filled = Object.fromEntries(Object.entries(row).filter(([, value]) => value !== ''));
    const key = Object.keys(filled).sort().join('|');
    const list = groups.get(key) ?? [];
    list.push(filled);
    groups.set(key, list);
  });

  return Array.from(groups.values()).map((group, index) => {
    const headers = Object.keys(group[0]).sort();
    const csv = toCsv([headers, ...group.map((row) => headers.map((header) => row[header] ?? ''))]);
    return new File([csv], `${name}-${index + 1}.csv`, { type: 'text/csv' });
  });
}

export function prepareContactImport(kind: ContactImportKind, rows: Record<string, string>[]): PreparedImport {
  const errors: string[] = [];
  const prepared: Record<string, string>[] = [];
  const now = new Date().toISOString();

  rows.forEach((row, index) => {
    const line = index + 2;
    const blank = Object.values(row).every((value) => !value);
    if (blank) return;

    if (kind === 'customer') {
      const type = (row.type || 'INDIVIDUAL').toUpperCase();
      if (!CUSTOMER_TYPES.has(type)) {
        errors.push(`Row ${line}: type must be INDIVIDUAL or COMPANY.`);
        return;
      }
      if (!row.phone) {
        errors.push(`Row ${line}: phone is required.`);
        return;
      }
      const payload: Record<string, string> = {
        customerId: row.customerId || idFor('CUS', index),
        type,
        phone: row.phone,
        lastSynced: now,
      };
      if (row.firstName) payload.firstName = row.firstName;
      if (row.lastName) payload.lastName = row.lastName;
      if (row.email) payload.email = row.email;
      if (row.gender) payload.gender = row.gender;
      if (row.contactPerson) payload.contactPerson = row.contactPerson;
      if (row.creditLimit) payload.creditLimit = row.creditLimit;
      if (row.taxId) payload.taxId = row.taxId;
      if (/^\d{4}-\d{2}-\d{2}/.test(row.date_of_birth || '')) payload.date_of_birth = row.date_of_birth.slice(0, 10);
      const address = addressJson(row);
      if (address) payload.address = address;
      prepared.push(payload);
      return;
    }

    const type = (row.type || 'company').toLowerCase();
    if (!VENDOR_TYPES.has(type)) {
      errors.push(`Row ${line}: type must be individual or company.`);
      return;
    }
    if (!row.name) {
      errors.push(`Row ${line}: name is required.`);
      return;
    }
    const notes = [row.notes, [row.address, row.city, row.state, row.country, row.postalCode].filter(Boolean).join(', ')]
      .filter(Boolean)
      .join(' — ');
    const payload: Record<string, string> = {
      vendorId: row.vendorId || idFor('VEN', index),
      type,
      name: row.name,
      lastSynced: now,
    };
    if (row.email) payload.email = row.email;
    if (row.phone) payload.phone = row.phone;
    if (row.contactPerson) payload.contactPerson = row.contactPerson;
    if (row.currency && CURRENCIES.has(row.currency)) payload.currency = row.currency;
    if (row.classification && CLASSIFICATIONS.has(row.classification)) payload.classification = row.classification;
    if (row.industry) payload.industry = row.industry;
    const paymentTerms = apiPaymentTerms(row.paymentTerms);
    if (paymentTerms) payload.paymentTerms = paymentTerms;
    if (row.website) payload.website = row.website;
    if (row.taxId) payload.taxId = row.taxId;
    if (row.creditLimit) payload.creditLimit = row.creditLimit;
    if (row.openingBalance) payload.openingBalance = row.openingBalance;
    const notesValue = apiOptionalText(notes);
    if (notesValue) payload.notes = notesValue;
    prepared.push(payload);
  });

  return {
    files: groupFiles(kind === 'customer' ? 'customers' : 'vendors', prepared),
    errors,
  };
}
