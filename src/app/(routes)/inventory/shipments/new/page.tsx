'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="shipment"
      title="Shipment"
      createLabel="Create Shipment"
      closeHref="/inventory/shipments"
      fields={[
        { key: 'salesOrderId', label: 'Sales order', type: 'salesOrder' },
        { key: 'invoiceId', label: 'Invoice', type: 'invoice' },
        { key: 'customerId', label: 'Customer', type: 'customer' },
        { key: 'shipDate', label: 'Ship date', type: 'date' },
        { key: 'trackingNumber', label: 'Tracking number' },
        { key: 'carrier', label: 'Carrier' },
        { key: 'lines', label: 'Line items', type: 'lines' },
        { key: 'notes', label: 'Additional notes', type: 'textarea' },
        { key: 'attachments', label: 'Attachments', type: 'attachments' },
      ]}
    />
  );
}
