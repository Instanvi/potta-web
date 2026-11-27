'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="ar-payments"
      title="AR payment"
      columns={[
        { key: 'paymentDate', label: 'Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method', type: 'paymentMethod' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'invoiceId', label: 'Invoice', type: 'invoice' },
        { key: 'reference', label: 'Reference' },
      ]}
      fields={[
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'paymentDate', label: 'Payment date', type: 'date' },
        { key: 'method', label: 'Method', type: 'paymentMethod' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'invoiceId', label: 'Invoice', type: 'invoice' },
        { key: 'reference', label: 'Reference' },
        { key: 'applyToInvoice', label: 'Apply to invoice', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
