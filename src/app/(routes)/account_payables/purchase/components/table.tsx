'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { MoreVertical } from 'lucide-react';

import Button from '@potta/components/button';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState, ListToolbar } from '../../../_shared/states';

import useGetAllPurchaseOrders from '../hooks/useGetAllPurchaseOrders';
import useApprovePurchaseOrder from '../hooks/useApprovePurchaseOrder';
import useDeletePurchaseOrder from '../hooks/useDeletePurchaseOrder';
import Slider from '@potta/components/slideover';
import PurchaseOrderPage from '../new/page';
import PurchaseOrderViewModal from './PurchaseOrderViewModal';
import DynamicFilter from '@potta/components/dynamic-filter';
import useGetAllVendors from '../new/hooks/useGetAllVendors';
import { toast } from 'sonner';
interface IOption {
  value: string;
  label: string;
}

// Define types for purchase order
interface PurchaseOrder {
  uuid: string;
  orderNumber: string;
  orderDate: string;
  requiredDate: string;
  status: string;
  orderTotal: number;
  salePerson: {
    name: string;
  };
}

interface ApiResponse {
  data: PurchaseOrder[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

const InvoiceTable = () => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    string | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [statusFilter, vendorFilter, debouncedSearch],
  });

  const filter = {
    limit,
    page,
    sortBy: ['createdAt:DESC'],
    status: statusFilter === 'all' ? undefined : statusFilter,
    vendorId: vendorFilter === 'all' ? undefined : vendorFilter,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error, refetch } = useGetAllPurchaseOrders(filter);
  const approveMutation = useApprovePurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const { data: vendorsData, isLoading: vendorsLoading } = useGetAllVendors({ page: 1, limit: 100 });

  // Search and filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleVendorChange = (value: string) => {
    setVendorFilter(value);
  };

  // Handle modal closing when purchase order is created
  useEffect(() => {
    const handleCloseModal = () => {
      setIsOpen(false);
      // Reset form data when modal is closed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('resetPurchaseOrderForm'));
      }
    };

    window.addEventListener('closePurchaseOrderModal', handleCloseModal);
    return () => {
      window.removeEventListener('closePurchaseOrderModal', handleCloseModal);
    };
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs';
      case 'approved':
        return 'text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs';
      case 'shipped':
        return 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs';
      case 'draft':
        return 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs';
      case 'overdue':
        return 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs';
      default:
        return 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs';
    }
  };

  const formatDate = (date: string) => {
    const today = new Date();
    const inputDate = new Date(date);

    if (
      today.getDate() === inputDate.getDate() &&
      today.getMonth() === inputDate.getMonth() &&
      today.getFullYear() === inputDate.getFullYear()
    ) {
      return 'Today';
    }
    return inputDate.toLocaleDateString();
  };

  const handleViewPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrderId(purchaseOrder.uuid);
    setViewModalOpen(true);
  };

  const handleApprovePurchaseOrder = async (purchaseOrder: PurchaseOrder) => {
    // Show loading toast
    const loadingToast = toast.loading('Approving purchase order...');

    approveMutation.mutate(
      { purchaseOrderId: purchaseOrder.uuid },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success('Purchase order approved successfully!');
        },
        onError: (error: any) => {
          toast.dismiss(loadingToast);
          toast.error(
            `Failed to approve purchase order: ${
              error.message || 'Unknown error'
            }`
          );
        },
      }
    );
  };

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    console.log('Edit purchase order:', purchaseOrder);
    toast.success('Edit functionality coming soon!');
  };

  const handleDeletePurchaseOrder = async (purchaseOrder: PurchaseOrder) => {
    deleteMutation.mutate(
      { purchaseOrderId: purchaseOrder.uuid },
      {
        onSuccess: () => {
          toast.success('Purchase order deleted successfully!');
        },
        onError: (error: any) => {
          toast.error(
            `Failed to delete purchase order: ${
              error.message || 'Unknown error'
            }`
          );
        },
      }
    );
  };

  // Only the backend PurchaseOrderStatus enum values; others fail the enum cast server-side.
  const statusOptions: IOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'SHIPPED', label: 'Shipped' },
  ];

  const vendorOptions: IOption[] = [
    { value: 'all', label: 'All Vendors' },
    ...((vendorsData?.data ?? []) as { uuid?: string; name?: string }[])
      .filter((v) => !!v.uuid && !!v.name)
      .map((v) => ({ value: v.uuid as string, label: v.name as string })),
  ];

  // Filter configuration for DynamicFilter
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: statusOptions,
      value: statusFilter,
      onChange: handleStatusChange,
      selectClassName: 'min-w-[140px]',
    },
    {
      key: 'vendor',
      label: 'Vendor',
      options: vendorOptions,
      value: vendorFilter,
      onChange: handleVendorChange,
      selectClassName: 'min-w-[180px]',
    },
  ];

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      accessorKey: 'salePerson.name',
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.salePerson?.name || '-'}</div>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.orderDate)}
        </div>
      ),
    },
    {
      accessorKey: 'requiredDate',
      header: 'Required Date',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.original.requiredDate)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className={`${getStatusStyle(row.original.status)} w-fit`}>
          {row.original.status.toUpperCase()}
        </div>
      ),
    },
    {
      accessorKey: 'orderTotal',
      header: 'Total',
      cell: ({ row }) => (
        <div className="text-sm">
          XAF{' '}
          {row.original.orderTotal?.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleViewPurchaseOrder(row.original)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditPurchaseOrder(row.original)}
                disabled={
                  row.original.status === 'APPROVED' ||
                  row.original.status === 'SHIPPED'
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleApprovePurchaseOrder(row.original)}
                disabled={
                  row.original.status === 'APPROVED' ||
                  row.original.status === 'SHIPPED' ||
                  approveMutation.isPending
                }
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeletePurchaseOrder(row.original)}
                disabled={
                  row.original.status === 'APPROVED' ||
                  row.original.status === 'SHIPPED' ||
                  deleteMutation.isPending
                }
                className="text-red-600 focus:text-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      <ListToolbar
        actions={
          <>
            <Button
              text={'Export'}
              icon={<i className="ri-upload-2-line"></i>}
              theme="lightBlue"
              type={'button'}
              color={true}
            />
            <Button
              text={'Create Purchase Order'}
              icon={<i className="ri-file-add-line"></i>}
              theme="default"
              type={'button'}
              onClick={() => setIsOpen(true)}
            />
          </>
        }
      >
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search by order number, vendor or notes..."
          filters={filterConfig}
          className="p-0"
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataGrid
          data={(data?.data ?? []) as PurchaseOrder[]}
          columns={columns}
          loading={isLoading}
          {...tableProps(data?.meta, data?.data?.length)}
        />
      )}

      {/* Create Purchase Order Modal */}
      <Slider
        open={isOpen}
        setOpen={setIsOpen}
        edit={false}
        title="Create Purchase Order"
      >
        <div className="w-full mx-auto">
          <PurchaseOrderPage />
        </div>
      </Slider>

      {/* Purchase Order View Modal */}
      <PurchaseOrderViewModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        purchaseOrderId={selectedPurchaseOrderId}
      />
    </div>
  );
};

export default InvoiceTable;
