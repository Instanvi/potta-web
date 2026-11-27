'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'bill', label: 'Bill' },
  { value: 'journal', label: 'Journal' },
  { value: 'sales_receipt', label: 'Sales receipt' },
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="recurring-template"
      title="Recurring template"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'documentType', label: 'Document type' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'paymentMethod', label: 'Payment method', type: 'paymentMethod' },
        { key: 'isActive', label: 'Active' },
        { key: 'nextRunDate', label: 'Next run' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        {
          key: 'documentType',
          label: 'Document type',
          type: 'select',
          options: DOCUMENT_TYPES,
        },
        {
          key: 'frequency',
          label: 'Frequency',
          type: 'select',
          options: FREQUENCIES,
        },
        { key: 'isActive', label: 'Active', type: 'checkbox' },
        { key: 'nextRunDate', label: 'Next run date', type: 'date' },
        { key: 'endDate', label: 'End date', type: 'date' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'paymentMethod', label: 'Payment method', type: 'paymentMethod' },
        { key: 'lines', label: 'Line items', type: 'lines' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
