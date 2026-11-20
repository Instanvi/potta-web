'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="period-close"
      title="Period close"
      columns={[
        { key: 'periodStart', label: 'Start' },
        { key: 'periodEnd', label: 'End' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created' },
      ]}
      fields={[
        { key: 'periodStart', label: 'Period start', type: 'date' },
        { key: 'periodEnd', label: 'Period end', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      actions={[
        { label: 'Close period', action: 'close', confirm: true },
        { label: 'Reopen period', action: 'reopen', confirm: true },
      ]}
    />
  );
}
