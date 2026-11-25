'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="sales-order"
      title="Sales order"
      closeHref="/account_receivables/sales-orders"
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
