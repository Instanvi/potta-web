'use client';
import Button from '@potta/components/button';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { SquareStack } from 'lucide-react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import RestockModal from './slides/components/restock';
import { useInventory } from '../_utils/context';
import DynamicFilter from '@potta/components/dynamic-filter';
import useImportFromPay from '../_hooks/useImportFromPay';
import { PayImportResult } from '../_utils/payImportApi';
import { Can } from '@/components/auth/can';

const summarize = (r: PayImportResult) =>
  [
    `${r.received} in Pay`,
    r.created && `${r.created} new`,
    r.updated && `${r.updated} updated`,
    r.linked && `${r.linked} linked`,
    r.disabled && `${r.disabled} disabled`,
  ]
    .filter(Boolean)
    .join(' · ');

const issueList = (issues: PayImportResult['skipped']) =>
  issues
    .slice(0, 5)
    .map((i) => `${i.name || i.payProductId}: ${i.reason}`)
    .join('\n') + (issues.length > 5 ? `\n…and ${issues.length - 5} more` : '');

/** Products are owned by payment-service: they arrive with "Sync from Pay"; Potta only restocks. */
const Filter = () => {
  const { selectedProduct, filters, setFilters } = useInventory();

  const [selectedValue, setSelectedValue] = useState(filters.sort);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedProductType, setSelectedProductType] = useState(filters.productType);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const importFromPay = useImportFromPay();

  const handleChange = (value: string) => {
    setSelectedValue(value);
    setFilters({ ...filters, sort: value });
  };

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value);
    setFilters({ ...filters, productType: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSearchClear = () => {
    setSearchValue('');
    setFilters({ ...filters, search: '' });
  };

  const handleSyncFromPay = async () => {
    try {
      const result = await importFromPay.mutateAsync(undefined);
      toast.success('Products synced from Pay', { description: summarize(result) });
      if (result.skipped.length) {
        toast.error(`${result.skipped.length} product(s) could not be synced`, {
          description: issueList(result.skipped),
        });
      }
      if (result.warnings.length) {
        toast.warning(`${result.warnings.length} product(s) synced with warnings`, {
          description: issueList(result.warnings),
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to sync products from Pay.');
    }
  };

  const filterConfig = [
    {
      key: 'productType',
      label: 'Product Type',
      options: [
        { label: 'All Products', value: 'ALL' },
        { label: 'Inventory', value: 'INVENTORY' },
        { label: 'Non-Inventory', value: 'NON_INVENTORY' },
        { label: 'Assembly', value: 'ASSEMBLY' },
        { label: 'Groups', value: 'SIMPLEGROUPS' },
      ],
      value: selectedProductType,
      onChange: handleProductTypeChange,
      selectClassName: 'min-w-[160px]',
    },
    {
      key: 'sort',
      label: 'Sort by',
      options: [
        { label: 'Created At:ASC', value: 'createdAt:ASC' },
        { label: 'Created At:DESC', value: 'createdAt:DESC' },
        { label: 'Updated At:ASC', value: 'updatedAt:ASC' },
        { label: 'Updated At:DESC', value: 'updatedAt:DESC' },
      ],
      value: selectedValue,
      onChange: handleChange,
      selectClassName: 'min-w-[140px]',
    },
  ];

  return (
    <>
      <div className="flex w-full items-center justify-between gap-3 overflow-visible">
        <div className="flex-1">
          <DynamicFilter
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            searchPlaceholder="Search inventory..."
            filters={filterConfig}
            className="p-0 bg-transparent"
          />
        </div>

        <div className="relative flex items-center gap-3">
          <Can resource="Item" action="restock">
            <Button
              type="button"
              text="Restock"
              icon={<SquareStack className="h-4 w-4" />}
              theme="outline"
              onClick={() => setIsRestockOpen(true)}
              disabled={!selectedProduct}
            />
          </Can>
          <Can resource="Item" action="create">
            <Button
              type="button"
              text={importFromPay.isPending ? 'Syncing…' : 'Sync from Pay'}
              icon={<ArrowsClockwise size={16} className={importFromPay.isPending ? 'animate-spin' : ''} />}
              theme="default"
              onClick={handleSyncFromPay}
              disabled={importFromPay.isPending}
            />
          </Can>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Products are managed in Pay. Create or edit them there, then use Sync from Pay.
      </p>

      {typeof window !== 'undefined' &&
        createPortal(<RestockModal open={isRestockOpen} setOpen={setIsRestockOpen} />, document.body)}
    </>
  );
};

export default Filter;
