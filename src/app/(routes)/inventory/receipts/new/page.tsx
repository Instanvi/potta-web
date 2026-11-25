'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="item-receipt"
      title="Item receipt"
      closeHref="/inventory/receipts"
      fields={[
        { key: 'purchaseOrderId', label: 'Purchase order', type: 'purchaseOrder' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'receivedDate', label: 'Received date', type: 'date' },
        { key: 'postInventory', label: 'Post inventory', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Received items', type: 'lines' },
      ]}
      postActions={[
        { label: 'Post inventory', action: 'post-inventory', confirm: true },
      ]}
    />
  );
}
