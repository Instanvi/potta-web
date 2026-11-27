'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="estimate"
      title="Estimate"
      createLabel="Create Estimate"
      closeHref="/account_receivables/estimates"
      fields={[
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'issueDate', label: 'Issue date', type: 'date' },
        { key: 'expiryDate', label: 'Expiry date', type: 'date' },
        { key: 'lines', label: 'Line items', type: 'lines' },
        { key: 'notes', label: 'Additional notes', type: 'textarea' },
        { key: 'attachments', label: 'Attachments', type: 'attachments' },
      ]}
    />
  );
}
