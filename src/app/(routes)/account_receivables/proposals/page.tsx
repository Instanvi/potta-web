'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="proposal"
      title="Proposal"
      createLabel="New Proposal"
      createHref="/account_receivables/proposals/new"
      documentKind="proposal"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
        { key: 'customerId', label: 'Customer' },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'opportunityId', label: 'Opportunity', type: 'opportunity' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Line items', type: 'lines' },
      ]}
    />
  );
}
