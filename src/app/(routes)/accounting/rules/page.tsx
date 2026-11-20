'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="bank-rule"
      title="Bank rule"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'isActive', label: 'Active' },
        { key: 'priority', label: 'Priority' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
        { key: 'priority', label: 'Priority', type: 'number' },
        { key: 'conditions', label: 'Conditions (JSON)', type: 'json' },
        { key: 'actions', label: 'Actions (JSON)', type: 'json' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
