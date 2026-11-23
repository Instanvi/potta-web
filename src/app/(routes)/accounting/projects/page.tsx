'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';
import { expenseProjectsApi } from './utils/api';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="expense-projects"
      title="Project"
      api={expenseProjectsApi}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
        { key: 'budget', label: 'Budget target' },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'budget', label: 'Budget target (optional)', type: 'number' },
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'endDate', label: 'End date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
