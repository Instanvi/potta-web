'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="item-receipt"
      title="Item receipt"
      columns={[
        { key: 'purchaseOrderId', label: 'PO' },
        { key: 'vendorId', label: 'Vendor' },
        { key: 'status', label: 'Status' },
        { key: 'receivedDate', label: 'Received' },
      ]}
      fields={[
        { key: 'purchaseOrderId', label: 'Purchase order', type: 'purchaseOrder' },
        { key: 'vendorId', label: 'Vendor', type: 'vendor' },
        { key: 'receivedDate', label: 'Received date', type: 'date' },
        { key: 'postInventory', label: 'Post inventory', type: 'checkbox' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
        { key: 'lines', label: 'Received items', type: 'lines' },
      ]}
      actions={[
        { label: 'Post inventory', action: 'post-inventory', confirm: true },
      ]}
    />
  );
}
