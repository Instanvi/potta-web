'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="contract"
      title="Contract"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
      ]}
      fields={[
        { key: 'title', label: 'Title' },
        { key: 'proposalId', label: 'Proposal ID' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'endDate', label: 'End date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
