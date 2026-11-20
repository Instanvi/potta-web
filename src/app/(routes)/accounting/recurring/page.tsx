'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="recurring-template"
      title="Recurring template"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'documentType', label: 'Document type' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'isActive', label: 'Active' },
        { key: 'nextRunDate', label: 'Next run' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'documentType', label: 'Document type' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
        { key: 'nextRunDate', label: 'Next run date', type: 'date' },
        { key: 'endDate', label: 'End date', type: 'date' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'templatePayload', label: 'Template payload (JSON)', type: 'json' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
