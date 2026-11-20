'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="sales-order"
      title="Sales order"
      columns={[
        { key: 'customerId', label: 'Customer' },
        { key: 'status', label: 'Status' },
        { key: 'orderDate', label: 'Order date' },
        { key: 'total', label: 'Total' },
      ]}
      fields={[
        { key: 'customerId', label: 'Customer ID' },
        { key: 'estimateId', label: 'Estimate ID' },
        { key: 'orderDate', label: 'Order date', type: 'date' },
        { key: 'stockReserved', label: 'Stock reserved', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Lines (JSON)', type: 'json' },
      ]}
    />
  );
}
