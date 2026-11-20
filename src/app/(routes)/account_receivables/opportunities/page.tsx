'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="opportunity"
      title="Opportunity"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' },
        { key: 'expectedCloseDate', label: 'Expected close' },
        { key: 'customerId', label: 'Customer' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'leadId', label: 'Lead', type: 'lead' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'expectedCloseDate', label: 'Expected close', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
