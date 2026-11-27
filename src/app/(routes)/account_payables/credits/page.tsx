'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="supplier-credit"
      title="Supplier credit"
      createLabel="New Supplier Credit"
      createHref="/account_payables/credits/new"
      documentKind="supplier_credit"
      columns={[
        { key: 'vendorId', label: 'Vendor' },
        { key: 'creditAmount', label: 'Amount' },
        { key: 'status', label: 'Status' },
        { key: 'issueDate', label: 'Issue date' },
        { key: 'reason', label: 'Reason' },
      ]}
      fields={[
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'billId', label: 'Bill', type: 'bill' },
        { key: 'creditAmount', label: 'Credit amount', type: 'number' },
        { key: 'issueDate', label: 'Issue date', type: 'date' },
        { key: 'reason', label: 'Reason' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Line items', type: 'lines' },
      ]}
    />
  );
}
