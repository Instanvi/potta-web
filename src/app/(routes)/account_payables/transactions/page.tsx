'use client';

import { BooksTransactionsHub } from '@/components/books/BooksTransactionsHub';

export default function Page() {
  return (
    <BooksTransactionsHub
      defaultTab="bills"
      tabs={[
        {
          id: 'bills',
          label: 'Bills',
          path: 'bills',
          listMode: 'get',
          columns: [
            { key: 'billNumber', label: 'Number' },
            { key: 'status', label: 'Status' },
            { key: 'total', label: 'Total' },
            { key: 'dueDate', label: 'Due' },
          ],
        },
        {
          id: 'expenses',
          label: 'Expenses',
          path: 'expense/transactions',
          listMode: 'payroll',
          columns: [
            { key: 'date', label: 'Date' },
            { key: 'merchant', label: 'Merchant' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ],
        },
        {
          id: 'payments',
          label: 'AP payments',
          path: 'ap-payments',
          columns: [
            { key: 'paymentDate', label: 'Date' },
            { key: 'amount', label: 'Amount' },
            { key: 'vendorId', label: 'Vendor' },
            { key: 'billId', label: 'Bill' },
          ],
        },
        {
          id: 'credits',
          label: 'Credits',
          path: 'supplier-credit',
          columns: [
            { key: 'vendorId', label: 'Vendor' },
            { key: 'creditAmount', label: 'Amount' },
            { key: 'status', label: 'Status' },
            { key: 'issueDate', label: 'Issue date' },
          ],
        },
      ]}
    />
  );
}
