'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="project"
      title="Project"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
        { key: 'budget', label: 'Budget' },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'customerId', label: 'Customer ID' },
        { key: 'budget', label: 'Budget', type: 'number' },
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'endDate', label: 'End date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
