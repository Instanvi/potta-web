'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="proposal"
      title="Proposal"
      createLabel="Create Proposal"
      closeHref="/account_receivables/proposals"
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'opportunityId', label: 'Opportunity', type: 'opportunity' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'lines', label: 'Line items', type: 'lines' },
        { key: 'notes', label: 'Additional notes', type: 'textarea' },
        { key: 'attachments', label: 'Attachments', type: 'attachments' },
      ]}
    />
  );
}
