'use client';

import { BooksResourcePage } from '@/components/books/BooksResourcePage';

export default function Page() {
  return (
    <BooksResourcePage
      resourcePath="fixed-asset"
      title="Fixed asset"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'assetNumber', label: 'Asset #' },
        { key: 'status', label: 'Status' },
        { key: 'purchaseCost', label: 'Cost' },
        { key: 'purchaseDate', label: 'Purchase date' },
      ]}
      fields={[
        { key: 'name', label: 'Name' },
        { key: 'assetNumber', label: 'Asset number' },
        { key: 'purchaseCost', label: 'Purchase cost', type: 'number' },
        { key: 'salvageValue', label: 'Salvage value', type: 'number' },
        { key: 'usefulLifeMonths', label: 'Useful life (months)', type: 'number' },
        { key: 'purchaseDate', label: 'Purchase date', type: 'date' },
        { key: 'assetAccountId', label: 'Asset account', type: 'account' },
        { key: 'depreciationExpenseAccountId', label: 'Depreciation expense account', type: 'account' },
        { key: 'accumulatedDepreciationAccountId', label: 'Accumulated depreciation account', type: 'account' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      actions={[
        { label: 'Run depreciation', action: 'depreciate', confirm: true },
      ]}
    />
  );
}
