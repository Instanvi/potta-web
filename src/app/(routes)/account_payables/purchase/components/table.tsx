'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { MoreVertical } from 'lucide-react';

import Button from '@potta/components/button';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import { exportRows } from '@/lib/export-file';
import { sendPartyDocument } from '@/lib/document-send';
import type { DocumentChannel } from '@/components/document-channel-menu';

import useGetAllPurchaseOrders from '../hooks/useGetAllPurchaseOrders';
import useApprovePurchaseOrder from '../hooks/useApprovePurchaseOrder';
import useDeletePurchaseOrder from '../hooks/useDeletePurchaseOrder';
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
    email?: string | null;
    phone?: string | null;
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
  const router = useRouter();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    string | null
  >(null);
  const [sendTarget, setSendTarget] = useState<{
    order: PurchaseOrder;
    channel: DocumentChannel;
  } | null>(null);
  const [sending, setSending] = useState(false);
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

  const { table, onTableChange } = useDataTableHandle<PurchaseOrder>();
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
      enableHiding: false,
      header: '',
      cell: ({ row }) => {
        const order = row.original;
        const vendorEmail = (order.salePerson?.email || '').trim();
        const vendorPhone = (order.salePerson?.phone || '').trim();
        const hasVendor = Boolean(order.salePerson);

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleViewPurchaseOrder(order)}
                >
                  View Details
                </DropdownMenuItem>
                {hasVendor ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!vendorEmail || sending}
                      title={
                        vendorEmail
                          ? `Email download link to ${vendorEmail}`
                          : 'Add a vendor email first'
                      }
                      onClick={() => {
                        if (!vendorEmail) return;
                        setSendTarget({ order, channel: 'email' });
                      }}
                    >
                      <i className="ri-mail-line mr-2" />
                      <span className="flex min-w-0 flex-col">
                        <span>Send by email</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {vendorEmail || 'No email on file'}
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!vendorPhone || sending}
                      title={
                        vendorPhone
                          ? `Text download link to ${vendorPhone}`
                          : 'Add a vendor phone first'
                      }
                      onClick={() => {
                        if (!vendorPhone) return;
                        setSendTarget({ order, channel: 'sms' });
                      }}
                    >
                      <i className="ri-message-2-line mr-2" />
                      <span className="flex min-w-0 flex-col">
                        <span>Send by SMS</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {vendorPhone || 'No phone on file'}
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  onClick={() => handleEditPurchaseOrder(order)}
                  disabled={
                    order.status === 'APPROVED' || order.status === 'SHIPPED'
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleApprovePurchaseOrder(order)}
                  disabled={
                    order.status === 'APPROVED' ||
                    order.status === 'SHIPPED' ||
                    approveMutation.isPending
                  }
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePurchaseOrder(order)}
                  disabled={
                    order.status === 'APPROVED' ||
                    order.status === 'SHIPPED' ||
                    deleteMutation.isPending
                  }
                  className="text-red-600 focus:text-red-700"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div ref={containerRef}>
      <ListToolbar
        actions={
          <>
            {table ? <DataTableViewOptions table={table} /> : null}
            <Button
              text={'Export'}
              icon={<i className="ri-upload-2-line"></i>}
              theme="lightBlue"
              type={'button'}
              color={true}
              onClick={() =>
                void exportRows({
                  filename: 'purchase-orders',
                  rows: (data?.data ?? []) as PurchaseOrder[],
                  columns: [
                    { key: 'orderNumber', header: 'Order number' },
                    {
                      key: 'salePerson',
                      header: 'Vendor',
                      value: (row) => row.salePerson?.name || '',
                    },
                    {
                      key: 'orderDate',
                      header: 'Order date',
                      value: (row) =>
                        row.orderDate ? new Date(row.orderDate).toLocaleDateString() : '',
                    },
                    {
                      key: 'requiredDate',
                      header: 'Required date',
                      value: (row) =>
                        row.requiredDate
                          ? new Date(row.requiredDate).toLocaleDateString()
                          : '',
                    },
                    { key: 'status', header: 'Status' },
                    { key: 'orderTotal', header: 'Total' },
                  ],
                })
              }
            />
            <Button
              text={'Create Purchase Order'}
              icon={<i className="ri-file-add-line"></i>}
              theme="default"
              type={'button'}
              onClick={() => router.push('/account_payables/purchase/new')}
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
        <DataTable
          onTableChange={onTableChange}
          data={(data?.data ?? []) as PurchaseOrder[]}
          columns={columns}
          loading={isLoading}
          {...tableProps(data?.meta, data?.data?.length)}
        
          storageKey="purchase-orders-table"
        />
      )}

      {/* Purchase Order View Modal */}
      <PurchaseOrderViewModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        purchaseOrderId={selectedPurchaseOrderId}
      />
      <ConfirmModal
        open={Boolean(sendTarget)}
        title={
          sendTarget?.channel === 'sms'
            ? 'Send purchase order by SMS?'
            : 'Send purchase order by email?'
        }
        message={
          sendTarget?.channel === 'sms'
            ? `Text a download link for ${sendTarget.order.orderNumber} to ${
                sendTarget.order.salePerson?.phone?.trim() || 'the vendor'
              }?`
            : `Email a download link for ${sendTarget?.order.orderNumber || ''} to ${
                sendTarget?.order.salePerson?.email?.trim() || 'the vendor'
              }?`
        }
        confirmText="Send"
        isLoading={sending}
        onClose={() => {
          if (!sending) setSendTarget(null);
        }}
        onConfirm={() => {
          if (!sendTarget) return;
          const { order, channel } = sendTarget;
          const email = (order.salePerson?.email || '').trim();
          const phone = (order.salePerson?.phone || '').trim();
          setSending(true);
          void sendPartyDocument('purchase_order', order.uuid, {
            channel,
            to: channel === 'email' ? email : undefined,
            phone: channel === 'sms' ? phone : undefined,
          })
            .then((res) => {
              toast.success(
                res.channel === 'sms'
                  ? `Purchase order texted to ${res.to}`
                  : `Purchase order emailed to ${res.to}`,
              );
              setSendTarget(null);
            })
            .catch((err: unknown) => {
              const message =
                err && typeof err === 'object' && 'response' in err
                  ? String(
                      (
                        err as {
                          response?: { data?: { message?: string } };
                        }
                      ).response?.data?.message || '',
                    )
                  : '';
              toast.error(
                message || 'Failed to send purchase order download link',
              );
            })
            .finally(() => setSending(false));
        }}
      />
    </div>
  );
};

export default InvoiceTable;
