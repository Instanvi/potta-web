'use client';
import React, { useState, useEffect } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
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
import { documentsApi } from '../_utils/api';
import Image from 'next/image';
import ProductEditStepperModal from './ProductEditStepperModal';

const InventoryTable = () => {
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productDetails, setproductDetails] = useState<Product | null>(null);
  const { setSelectedProduct } = useInventory();
  const [imageUrls, setImageUrls] = useState<{ [productId: string]: string }>(
    {}
  );

  // Handle row click to view product details
  const handleRowClick = (row: Product) => {
    setSelectedProduct(row);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row: { original } }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 grid content-center ">
            <Image
              src={
                imageUrls[original.uuid] ||
                (Array.isArray(original.documents) &&
                original.documents.length > 0 &&
                original.documents[0]?.url
                  ? original.documents[0].url
                  : '/images/placeholder.png')
              }
              alt=""
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-0.5">{original.name}</p>
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
      cell: () => <div className="">355</div>,
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
            <DropdownMenuItem
              onClick={() => {
                setOpenUpdateModal(original.uuid);
                setproductDetails({
                  ...original,
                  cost: Number(original.cost),
                  salesPrice: Number(original.salesPrice),
                  images: Array.isArray(original.documents)
                    ? original.documents
                        .filter(
                          (doc: any) =>
                            doc.mimeType && doc.mimeType.startsWith('image')
                        )
                        .map((doc: any) => doc.url)
                    : [],
                });
                setIsEditOpen(true);
              }}
            >
              <i className="ri-edit-line mr-2"></i> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOpenDeleteModal(original.uuid);
                setIsDeleteOpen(true);
              }}
              className="text-red-600"
            >
              <i className="ri-delete-bin-line mr-2"></i> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters } = useInventory();

  const filter: Filter = {
    page,
    limit,
    search: filters.search,
    productType:
      filters.productType !== 'ALL' ? filters.productType : undefined,
    sort: filters.sort,
  };
  const { data, isLoading, error, refetch } = useGetAllProducts(filter);

  // Fetch signed URLs for product images
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!data?.data) return;
      // Collect all document IDs for products with images
      const docIdMap: { [productId: string]: string } = {};
      data.data.forEach((product: Product) => {
        if (
          Array.isArray(product.documents) &&
          product.documents.length > 0 &&
          product.documents[0]?.uuid
        ) {
          docIdMap[product.uuid] = product.documents[0].uuid;
        }
      });
      const docIds = Object.values(docIdMap);
      if (docIds.length === 0) return;
      try {
        const res = await documentsApi.bulkDownload(docIds);
        // Map productId to signed URL
        const urlMap: { [productId: string]: string } = {};
        let i = 0;
        for (const [productId, docId] of Object.entries(docIdMap)) {
          urlMap[productId] = res.urls[i] || '';
          i++;
        }
        setImageUrls(urlMap);
      } catch (e) {
        // ignore
      }
    };
    fetchSignedUrls();
  }, [data?.data]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handlePerRowsChange = (newLimit: number, newPage: number) => {
    setLimit(newLimit);
    setPage(newPage); // Reset page when changing rows per page
  };
  return (
    <div className="mt-10">
      <div></div>
      <DataGrid
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
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
