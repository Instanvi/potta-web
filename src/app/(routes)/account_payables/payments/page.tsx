'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="ap-payments"
      title="AP payment"
      columns={[
        { key: 'paymentDate', label: 'Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method', type: 'paymentMethod' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'billId', label: 'Bill', type: 'bill' },
        { key: 'reference', label: 'Reference' },
      ]}
      fields={[
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'paymentDate', label: 'Payment date', type: 'date' },
        { key: 'method', label: 'Method', type: 'paymentMethod' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'billId', label: 'Bill', type: 'bill' },
        { key: 'reference', label: 'Reference' },
        { key: 'applyToBill', label: 'Apply to bill', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
