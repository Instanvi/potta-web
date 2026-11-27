'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="supplier-credit"
      title="Supplier credit"
      createLabel="Create Supplier Credit"
      closeHref="/account_payables/credits"
      fields={[
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'billId', label: 'Bill', type: 'bill' },
        { key: 'creditAmount', label: 'Credit amount', type: 'number' },
        { key: 'issueDate', label: 'Issue date', type: 'date' },
        { key: 'reason', label: 'Reason' },
        { key: 'lines', label: 'Line items', type: 'lines' },
        { key: 'notes', label: 'Additional notes', type: 'textarea' },
        { key: 'attachments', label: 'Attachments', type: 'attachments' },
      ]}
    />
  );
}
