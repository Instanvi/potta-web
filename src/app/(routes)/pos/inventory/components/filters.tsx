'use client';
import Button from '@potta/components/button';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

import ProductStepperModal from './ProductStepperModal';
import { CustomSheet } from '@potta/components/ui/sheet';
import { Proportions, SquareStack } from 'lucide-react';
import RestockModal from './slides/components/restock';
import { useInventory } from '../_utils/context';
import DynamicFilter from '@potta/components/dynamic-filter';
import useImportProductsCsv from '../_hooks/useImportProductsCsv';

const Filter = () => {
  const { selectedProduct, filters, setFilters } = useInventory();

  const [selectedValue, setSelectedValue] = useState(filters.sort);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedProductType, setSelectedProductType] = useState(
    filters.productType
  );
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [stepperProductType, setStepperProductType] = useState<
    'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS'
  >('INVENTORY');
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const csvInputRef = React.useRef<HTMLInputElement | null>(null);
  const importCsvMutation = useImportProductsCsv();

  const handleChange = (value: string) => {
    setSelectedValue(value);
    setFilters({ ...filters, sort: value });
  };

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value);
    setFilters({ ...filters, productType: value });
  };

  const handleRestock = () => {
    setIsRestockOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSearchClear = () => {
    setSearchValue('');
    setFilters({ ...filters, search: '' });
  };

  const handleOpenCsvPicker = () => {
    csvInputRef.current?.click();
  };

  const handleCsvSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a valid CSV file.');
      e.target.value = '';
      return;
    }

    try {
      setIsImportingCsv(true);
      await importCsvMutation.mutateAsync({ file });
      toast.success('Products import started successfully.');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to import CSV file.'
      );
    } finally {
      setIsImportingCsv(false);
      e.target.value = '';
    }
  };

  const handleSelectCreateType = (
    type: 'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS'
  ) => {
    setStepperProductType(type);
    setIsCreateSheetOpen(false);
    setIsStepperOpen(true);
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
      <div className="w-full flex justify-between items-center overflow-visible">
        {/* Left side - Dynamic Filter */}
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

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-2 ml-4 relative">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvSelected}
          />
          <Button
            type={'button'}
            color
            text="Adjust"
            icon={<Proportions />}
            theme="lightBlue"
          />
          <Button
            type={'button'}
            color
            text="Restock"
            icon={<SquareStack />}
            theme="lightBlue"
            onClick={handleRestock}
            disabled={!selectedProduct}
          />
          <Button
            type={'button'}
            color
            text={isImportingCsv ? 'Importing...' : 'Import CSV'}
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
            onClick={handleOpenCsvPicker}
            disabled={isImportingCsv}
          />
          <button
            type="button"
            className="flex items-center gap-2 bg-[#005D1F] px-4 py-2.5 text-white hover:bg-green-900"
            onClick={() => setIsCreateSheetOpen(true)}
          >
            <i className="ri-file-add-line" />
            New Item
          </button>
        </div>
      </div>

      <CustomSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        side="left"
        heading="Create Products/Service"
        footer={<></>}
      >
        <div className="mx-auto mt-8 w-full max-w-xl space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-between border border-black/10 bg-white px-5 py-4 text-left text-base font-normal text-black hover:bg-black/[0.02]"
            onClick={() => handleSelectCreateType('INVENTORY')}
          >
            <span>Inventory Item</span>
            <i className="ri-arrow-right-line text-lg" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between border border-black/10 bg-white px-5 py-4 text-left text-base font-normal text-black hover:bg-black/[0.02]"
            onClick={() => handleSelectCreateType('NON_INVENTORY')}
          >
            <span>Non Inventory Item</span>
            <i className="ri-arrow-right-line text-lg" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between border border-black/10 bg-white px-5 py-4 text-left text-base font-normal text-black hover:bg-black/[0.02]"
            onClick={() => handleSelectCreateType('ASSEMBLY')}
          >
            <span>Assembly Item</span>
            <i className="ri-arrow-right-line text-lg" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between border border-black/10 bg-white px-5 py-4 text-left text-base font-normal text-black hover:bg-black/[0.02]"
            onClick={() => handleSelectCreateType('SIMPLEGROUPS')}
          >
            <span>Groups Item</span>
            <i className="ri-arrow-right-line text-lg" />
          </button>
        </div>
      </CustomSheet>

      <ProductStepperModal
        open={isStepperOpen}
        setOpen={setIsStepperOpen}
        productType={stepperProductType}
        onComplete={() => {
          setIsStepperOpen(false);
          // Optionally refresh the product list
        }}
      />
      {typeof window !== 'undefined' &&
        createPortal(
          <RestockModal open={isRestockOpen} setOpen={setIsRestockOpen} />,
          document.body
        )}
    </>
  );
};

export default Filter;
