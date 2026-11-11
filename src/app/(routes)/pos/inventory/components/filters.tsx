'use client';
import Button from '@potta/components/button';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { SquareStack } from 'lucide-react';
import { ArrowsClockwise, Plus } from '@phosphor-icons/react';
import RestockModal from './slides/components/restock';
import ProductStepperModal from './ProductStepperModal';
import { useInventory } from '../_utils/context';
import DynamicFilter from '@potta/components/dynamic-filter';
import useImportFromPay from '../_hooks/useImportFromPay';
import { PayImportResult } from '../_utils/payImportApi';
import { Can } from '@/components/auth/can';
import { ListToolbar } from '../../../_shared/states';

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

type ItemKind = 'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS';

const ITEM_KINDS: { value: ItemKind; label: string; hint: string }[] = [
  { value: 'INVENTORY', label: 'Inventory item', hint: 'Stocked goods with quantities' },
  { value: 'NON_INVENTORY', label: 'Non-inventory item', hint: 'Services or untracked goods' },
  { value: 'ASSEMBLY', label: 'Assembly', hint: 'Built from other items' },
  { value: 'SIMPLEGROUPS', label: 'Group', hint: 'Items sold together' },
];

/** Items are created here or arrive with "Sync from Pay"; Pay-linked items stay read-only. */
const Filter = () => {
  const { selectedProduct, filters, setFilters } = useInventory();

  const [selectedValue, setSelectedValue] = useState(filters.sort);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedProductType, setSelectedProductType] = useState(filters.productType);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isKindMenuOpen, setIsKindMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<ItemKind>('INVENTORY');
  const importFromPay = useImportFromPay();

  const startCreate = (kind: ItemKind) => {
    setCreateKind(kind);
    setIsKindMenuOpen(false);
    setIsCreateOpen(true);
  };

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
      <ListToolbar
        className="mb-2"
        actions={
          <>
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
                theme="outline"
                onClick={handleSyncFromPay}
                disabled={importFromPay.isPending}
              />
            </Can>
            <Can resource="Item" action="create">
              <div className="relative">
                <Button
                  type="button"
                  text="New item"
                  icon={<Plus size={16} />}
                  theme="default"
                  onClick={() => setIsKindMenuOpen((open) => !open)}
                />
                {isKindMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsKindMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-64 border border-black/10 bg-white py-1 shadow-lg">
                      {ITEM_KINDS.map((kind) => (
                        <button
                          key={kind.value}
                          type="button"
                          className="block w-full px-4 py-2 text-left hover:bg-gray-50"
                          onClick={() => startCreate(kind.value)}
                        >
                          <span className="block text-sm font-medium">{kind.label}</span>
                          <span className="block text-xs text-muted-foreground">{kind.hint}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Can>
          </>
        }
      >
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search inventory..."
          filters={filterConfig}
          className="p-0"
        />
      </ListToolbar>
      <p className="mb-4 text-xs text-muted-foreground">
        Create items here, or bring them in with Sync from Pay. Items linked to Pay are edited in Pay.
      </p>

      {typeof window !== 'undefined' &&
        createPortal(<RestockModal open={isRestockOpen} setOpen={setIsRestockOpen} />, document.body)}
      <ProductStepperModal open={isCreateOpen} setOpen={setIsCreateOpen} productType={createKind} />
    </>
  );
};

export default Filter;
