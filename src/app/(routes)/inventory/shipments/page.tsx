'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="shipment"
      title="Shipment"
      columns={[
        { key: 'shipDate', label: 'Ship date' },
        { key: 'status', label: 'Status' },
        { key: 'trackingNumber', label: 'Tracking' },
        { key: 'carrier', label: 'Carrier' },
        { key: 'customerId', label: 'Customer' },
      ]}
      fields={[
        { key: 'salesOrderId', label: 'Sales order ID' },
        { key: 'invoiceId', label: 'Invoice ID' },
        { key: 'customerId', label: 'Customer ID' },
        { key: 'shipDate', label: 'Ship date', type: 'date' },
        { key: 'trackingNumber', label: 'Tracking number' },
        { key: 'carrier', label: 'Carrier' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Lines (JSON)', type: 'json' },
      ]}
    />
  );
}
