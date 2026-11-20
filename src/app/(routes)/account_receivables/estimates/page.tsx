'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="estimate"
      title="Estimate"
      columns={[
        { key: 'customerId', label: 'Customer' },
        { key: 'status', label: 'Status' },
        { key: 'issueDate', label: 'Issue date' },
        { key: 'expiryDate', label: 'Expiry' },
        { key: 'total', label: 'Total' },
      ]}
      fields={[
        { key: 'customerId', label: 'Customer ID' },
        { key: 'issueDate', label: 'Issue date', type: 'date' },
        { key: 'expiryDate', label: 'Expiry date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Lines (JSON)', type: 'json' },
      ]}
      actions={[
        { label: 'Convert to sales order', action: 'convert-to-sales-order', confirm: true },
        { label: 'Convert to invoice', action: 'convert-to-invoice', confirm: true },
      ]}
    />
  );
}
