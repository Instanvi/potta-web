'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="opening-balance"
      title="Opening balance"
      columns={[
        { key: 'asOfDate', label: 'As of' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created' },
      ]}
      fields={[
        { key: 'asOfDate', label: 'As of date', type: 'date' },
        { key: 'lines', label: 'Lines (JSON)', type: 'json' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      actions={[{ label: 'Post opening balance', action: 'post', confirm: true }]}
    />
  );
}
