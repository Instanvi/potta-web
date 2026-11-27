'use client';

import { BooksDocumentCreatePage } from '@/components/books/BooksDocumentCreatePage';

export default function Page() {
  return (
    <BooksDocumentCreatePage
      resourcePath="item-receipt"
      title="Item receipt"
      createLabel="Create Item Receipt"
      closeHref="/inventory/receipts"
      fields={[
        { key: 'purchaseOrderId', label: 'Purchase order', type: 'purchaseOrder' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'receivedDate', label: 'Received date', type: 'date' },
        { key: 'postInventory', label: 'Post inventory after save', type: 'checkbox' },
        { key: 'lines', label: 'Received items', type: 'lines' },
        { key: 'notes', label: 'Additional notes', type: 'textarea' },
        { key: 'attachments', label: 'Attachments', type: 'attachments' },
      ]}
      postActions={[
        { label: 'Post inventory', action: 'post-inventory', confirm: true },
      ]}
    />
  );
}
