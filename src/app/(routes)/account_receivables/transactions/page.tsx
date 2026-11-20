'use client';

import { BooksTransactionsHub } from '@/components/books/BooksTransactionsHub';

const cols = [
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total' },
  { key: 'createdAt', label: 'Created' },
];

export default function Page() {
  return (
    <BooksTransactionsHub
      defaultTab="invoice"
      tabs={[
        { id: 'invoice', label: 'Invoices', path: 'invoice', columns: [{ key: 'invoiceNumber', label: 'Number' }, ...cols] },
        { id: 'credit', label: 'Credits', path: 'credit-note', columns: [{ key: 'creditNoteNumber', label: 'Number' }, ...cols] },
        { id: 'receipt', label: 'Sales receipts', path: 'sales-receipt', columns: [{ key: 'receiptNumber', label: 'Number' }, ...cols] },
        { id: 'payment', label: 'Payments', path: 'ar-payments', columns: [{ key: 'paymentDate', label: 'Date' }, { key: 'amount', label: 'Amount' }, { key: 'method', label: 'Method' }] },
      ]}
    />
  );
}
