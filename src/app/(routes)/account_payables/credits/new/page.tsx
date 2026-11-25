'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="supplier-credit"
      title="Supplier credit"
      closeHref="/account_payables/credits"
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
