'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="proposal"
      title="Proposal"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
        { key: 'customerId', label: 'Customer' },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'opportunityId', label: 'Opportunity ID' },
        { key: 'customerId', label: 'Customer ID' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Lines (JSON)', type: 'json' },
      ]}
    />
  );
}
