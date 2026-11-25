'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="sales-order"
      title="Sales order"
      createHref="/account_receivables/sales-orders/new"
      documentKind="sales_order"
      columns={[
        { key: 'customerId', label: 'Customer' },
        { key: 'status', label: 'Status' },
        { key: 'orderDate', label: 'Order date' },
        { key: 'total', label: 'Total' },
      ]}
      fields={[
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'estimateId', label: 'Estimate', type: 'estimate' },
        { key: 'orderDate', label: 'Order date', type: 'date' },
        { key: 'stockReserved', label: 'Stock reserved', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Line items', type: 'lines' },
      ]}
    />
  );
}
