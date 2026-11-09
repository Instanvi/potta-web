'use client';
import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { Filter, Product } from '../_utils/types';
import useGetAllProducts from '../../hooks/useGetAllProducts';
import DeleteModal from './deleteModal';
import ViewProductSlider from './slides/components/viewProduct';
import { useInventory } from '../_utils/context';
import { productImageUrl, productImageUrls } from '../_utils/images';
import { Can } from '@/components/auth/can';
import Image from 'next/image';
import ProductEditStepperModal from './ProductEditStepperModal';
import { StatusBadge } from '../../../_shared/states';
import { useServerPagination } from '@/hooks/use-server-pagination';

const InventoryTable = () => {
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productDetails, setproductDetails] = useState<Product | null>(null);
  const { setSelectedProduct, setSelectedProducts } = useInventory();

  // Handle row click to view product details
  const handleRowClick = (row: any) => {
    setSelectedProduct(row as Product);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row: { original } }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 grid content-center ">
            <Image
              src={productImageUrl(original)}
              alt=""
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-0.5">{original.name}</p>
          {original.payProductId && (
            <span title={`Managed in Pay · ${original.payProductId}`}>
              <StatusBadge tone="success">Pay</StatusBadge>
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'Sku',
      cell: ({ row: { original } }) => original.sku,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row: { original } }) =>
        original.category && typeof original.category === 'object'
          ? original.category.name
          : original.category || '',
    },
    {
      accessorKey: 'productType',
      header: 'Product Type',
      cell: ({ row: { original } }) => {
        const getTypeBadge = (type: string) => {
          const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
          switch (type) {
            case 'Assembly':
              return (
                <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                  Assembly
                </span>
              );
            case 'Group':
              return (
                <span
                  className={`${baseClasses} bg-purple-100 text-purple-800`}
                >
                  Group
                </span>
              );
            case 'Non-Inventory':
              return (
                <span
                  className={`${baseClasses} bg-orange-100 text-orange-800`}
                >
                  Non-Inventory
                </span>
              );
            default:
              return (
                <span className={`${baseClasses} bg-green-100 text-green-800`}>
                  Inventory
                </span>
              );
          }
        };

        if (original.structure === 'ASSEMBLY') return getTypeBadge('Assembly');
        if (original.structure === 'SIMPLEGROUPS') return getTypeBadge('Group');
        if (original.type === 'NON_INVENTORY')
          return getTypeBadge('Non-Inventory');
        return getTypeBadge('Inventory');
      },
    },
    {
      accessorKey: 'tax',
      header: 'Tax',
      cell: ({ row: { original } }) =>
        original.tax && typeof original.tax === 'object'
          ? original.tax.name
          : original.tax || '',
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row: { original } }) => <div>XAF {original.cost}</div>,
    },
    {
      accessorKey: 'salesPrice',
      header: 'Sale Price',
      cell: ({ row: { original } }) => <div>XAF {original.salesPrice}</div>,
    },
    {
      accessorKey: 'inventoryLevel',
      header: 'Inventory',
      cell: ({ row: { original } }) => <div>{original.inventoryLevel}</div>,
    },
    {
      accessorKey: 'reorderPoint',
      header: 'Reorder Point',
      cell: ({ row: { original } }) => <div>{original.reorderPoint ?? 0}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <i className="ri-more-2-fill text-xl text-gray-600"></i>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setOpenViewModal(original.uuid);
                setIsViewOpen(true);
              }}
            >
              <i className="ri-eye-line mr-2"></i> View Details
            </DropdownMenuItem>
            <Can resource="Item" action="update">
              <DropdownMenuItem
                onClick={() => {
                  setOpenUpdateModal(original.uuid);
                  setproductDetails({
                    ...original,
                    cost: Number(original.cost),
                    salesPrice: Number(original.salesPrice),
                    images: productImageUrls(original),
                  });
                  setIsEditOpen(true);
                }}
              >
                <i className="ri-edit-line mr-2"></i> {original.payProductId ? 'Managed in Pay' : 'Edit'}
              </DropdownMenuItem>
            </Can>
            {!original.payProductId && (
              <Can resource="Item" action="remove">
                <DropdownMenuItem
                  onClick={() => {
                    setOpenDeleteModal(original.uuid);
                    setIsDeleteOpen(true);
                  }}
                  className="text-destructive"
                >
                  <i className="ri-delete-bin-line mr-2"></i> Delete
                </DropdownMenuItem>
              </Can>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const { filters } = useInventory();
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [filters.search, filters.productType, filters.sort],
  });
  const [sortBy, sortOrder] = (filters.sort || 'createdAt:ASC').split(':') as [
    Filter['sortBy'],
    Filter['sortOrder'],
  ];

  const filter: Filter = {
    page,
    limit,
    search: filters.search,
    productType:
      filters.productType !== 'ALL'
        ? (filters.productType as Filter['productType'])
        : undefined,
    sortBy,
    sortOrder,
  };
  const { data, isLoading, refetch } = useGetAllProducts(filter);
  const rows = React.useMemo(() => data?.data || [], [data]);

  return (
    <div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onSelectionChange={(selected) => setSelectedProducts(selected as Product[])}
        {...tableProps(data?.meta, rows.length)}
      />
      {openDeleteModal && (
        <DeleteModal
          productID={openDeleteModal}
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
        />
      )}
      <ProductEditStepperModal
        open={isEditOpen}
        setOpen={setIsEditOpen}
        product={productDetails}
        productId={productDetails?.uuid || ''}
        onComplete={refetch}
      />
      {openViewModal && (
        <ViewProductSlider
          productId={openViewModal}
          open={isViewOpen}
          setOpen={setIsViewOpen}
        />
      )}
    </div>
  );
};

export default InventoryTable;
