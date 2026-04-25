// src/components/PaymentRequestDataTableWrapper.tsx (New File)
'use client';

import React, { useState } from 'react';

import {
  MoreHorizontal,
  Check as CheckIcon,
  Briefcase,
  Landmark,
} from 'lucide-react'; // Import necessary icons

import { cn } from '@potta/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Button } from '@potta/components/shadcn/button';
import { DataTable } from '@potta/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { Icon } from '@iconify/react';
import {
  useApproveBill,
  useBills,
  useRejectBill,
} from '@potta/hooks/api/accountPayables';
import toast from 'react-hot-toast';
import BillDetailsSlideover from './BillDetailsSlideover';
import Filter from './filters';
import Image from 'next/image';

interface PaymentRequestDataTableWrapperProps {
  search: string;
  status: string;
  paymentMethod: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onStatusChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
}

// --- Helper Functions (can be moved to utils) ---

// Helper for currency format (improved like PaidInvoicesTable)
const formatTableCurrency = (amount: number, currencyCode: string = 'XAF') => {
  if (currencyCode === 'XAF') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- Status Color Mapping ---
const statusColorMap: Record<
  string,
  { bg: string; text: string; border: string; icon: string; iconColor: string }
> = {
  DRAFT: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    icon: 'mdi:pencil-outline',
    iconColor: 'text-gray-400',
  },
  PENDING: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: 'mdi:clock-outline',
    iconColor: 'text-yellow-500',
  },
  PENDING_PAYMENT: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'mdi:clock-alert-outline',
    iconColor: 'text-orange-500',
  },
  ISSUED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'mdi:file-document-outline',
    iconColor: 'text-blue-500',
  },
  APPROVED: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'material-symbols:check',
    iconColor: 'text-green-500',
  },
  REJECTED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'mdi:close',
    iconColor: 'text-red-500',
  },
  PAID: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'mdi:check-circle',
    iconColor: 'text-emerald-500',
  },
  OVERDUE: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'mdi:alert-circle',
    iconColor: 'text-orange-500',
  },
  CANCELLED: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    icon: 'mdi:cancel',
    iconColor: 'text-gray-400',
  },
};

// --- Payment Method Image Mapping ---
const paymentMethodImageMap: Record<string, { icon: string; label: string }> = {
  CREDIT_CARD: { icon: '/icons/credit-card.svg', label: 'Credit Card' },
  BANK_TRANSFER: { icon: '/icons/bank.svg', label: 'Bank Transfer' },
  ACH_TRANSFER: { icon: '/icons/bank.svg', label: 'ACH Transfer' },
  MOBILE_MONEY: { icon: '/icons/mtn.svg', label: 'Mobile Money' },
  MTN_MOBILE_MONEY: { icon: '/icons/mtn.svg', label: 'MTN Mobile Money' },
  ORANGE_MONEY: { icon: '/icons/om.svg', label: 'Orange Money' },
  CASH: { icon: '/icons/cash.svg', label: 'Cash' },
  CREDIT: { icon: '/icons/credit.svg', label: 'Credit' },
  mtn: { icon: '/icons/mtn.svg', label: 'MTN Mobile Money' },
  orange: { icon: '/icons/om.svg', label: 'Orange Money' },
  'Credit Card': { icon: '/icons/credit-card.svg', label: 'Credit Card' },
  'Bank Transfer': { icon: '/icons/bank.svg', label: 'Bank Transfer' },
  'Mobile Money': { icon: '/icons/mobile-money.svg', label: 'Mobile Money' },
  Other: { icon: '/icons/payment.svg', label: 'Other' },
};

const PaymentMethodIcon: React.FC<{ method?: { name?: string } }> = ({
  method,
}) => {
  if (!method || !method.name) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-100">
          <span className="text-xs font-medium text-gray-500">?</span>
        </div>
        <span className="text-sm text-gray-400">-</span>
      </div>
    );
  }

  const paymentInfo =
    paymentMethodImageMap[method.name] || paymentMethodImageMap['Other'];

  return (
    <div className="flex items-center space-x-2">
      <div className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden">
        <Image
          src={paymentInfo.icon}
          alt={paymentInfo.label}
          width={24}
          height={24}
          className="h-full w-full object-contain"
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="text-xs font-medium text-gray-500 hidden">
          {method.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <span className="text-sm text-gray-600">{paymentInfo.label}</span>
    </div>
  );
};

// --- Main Wrapper Component ---

export function PaymentRequestDataTableWrapper({
  search,
  status,
  paymentMethod,
  onSearchChange,
  onSearchClear,
  onStatusChange,
  onPaymentMethodChange,
}: PaymentRequestDataTableWrapperProps) {
  // Map status filter
  let statusFilter: any = {};
  if (status !== 'all') {
    statusFilter.status = status.toUpperCase(); // API expects 'PENDING', 'PAID', etc.
  }

  // Remove search and paymentMethod from API call for client-side filtering
  const { data, isLoading, error } = useBills({
    body: { ...statusFilter },
  });
  const bills = data?.data || [];

  // Map API bills to table rows
  const requests = bills.map((bill: any) => ({
    id: bill.uuid,
    ref: bill.invoiceId || bill.invoiceNumber || '-',
    madeTo: bill.vendor?.name || bill.customer?.name || '-',
    category: bill.invoiceType || '-',
    amount: bill.invoiceTotal || 0,
    currency: bill.currency || 'XAF',
    method: { name: bill.paymentMethod },
    status: bill.status,
    date: bill.issuedDate
      ? new Date(bill.issuedDate).toLocaleDateString()
      : '-',
    dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-',
    vendorInvoiceNumber: bill.vendorInvoiceNumber || '-',
    notes: bill.notes || '-',
  }));

  // Approve/Reject hooks (handle cache invalidation internally)
  const approveBillMutation = useApproveBill({ ...statusFilter });
  const rejectBillMutation = useRejectBill({ ...statusFilter });

  // Client-side search and payment method filter
  let filteredRequests = requests;
  if (search) {
    const term = search.toLowerCase();
    filteredRequests = filteredRequests.filter(
      (row: (typeof requests)[0]) =>
        (row.madeTo && row.madeTo.toLowerCase().includes(term)) ||
        (row.category && row.category.toLowerCase().includes(term)) ||
        (row.ref && row.ref.toLowerCase().includes(term))
    );
  }
  if (paymentMethod && paymentMethod !== 'all') {
    filteredRequests = filteredRequests.filter(
      (row: (typeof requests)[0]) => row.method?.name === paymentMethod
    );
  }

  // State for details modal
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Define columns for TanStack Table
  const columns: ColumnDef<(typeof requests)[0]>[] = React.useMemo(
    () => [
      {
        accessorKey: 'ref',
        header: 'Ref',
        cell: ({ row }) => row.original.ref,
      },
      {
        accessorKey: 'madeTo',
        header: 'Made To',
        cell: ({ row }) => row.original.madeTo,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">
            {formatTableCurrency(row.original.amount, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => <PaymentMethodIcon method={row.original.method} />,
      },
      {
        accessorKey: 'status',
        header: 'Request Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig =
            statusColorMap[status] || statusColorMap['DRAFT'];

          // Format status for display (convert ISSUED to Issued)
          const displayStatus =
            status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

          return (
            <div className="flex items-center">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border
                  ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}
                `}
              >
                <div
                  className={`flex items-center justify-center rounded-full size-5 ${statusConfig.bg}`}
                >
                  <Icon
                    icon={statusConfig.icon}
                    width="16"
                    height="16"
                    className={statusConfig.iconColor}
                  />
                </div>
                <span>{displayStatus}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => row.original.date,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedBillId(row.original.id);
                  setDetailsOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              {row.original.status !== 'APPROVED' &&
                row.original.status !== 'REJECTED' && (
                  <>
                    <DropdownMenuItem
                      onClick={async () => {
                        toast.promise(
                          approveBillMutation.mutateAsync(row.original.id),
                          {
                            loading: 'Approving bill...',
                            success: 'Bill approved!',
                            error: (err) =>
                              err?.message || 'Failed to approve bill',
                          }
                        );
                      }}
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        toast.promise(
                          rejectBillMutation.mutateAsync(row.original.id),
                          {
                            loading: 'Rejecting bill...',
                            success: 'Bill rejected!',
                            error: (err) =>
                              err?.message || 'Failed to reject bill',
                          }
                        );
                      }}
                    >
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [approveBillMutation, rejectBillMutation]
  );

  if (error)
    <div>
      <Filter
        search={search}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        status={status}
        onStatusChange={onStatusChange}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
      />

      <div className="flex flex-col gap-4">
        <div className="text-red-500  px-4 py-2">Failed to load bills.</div>
      </div>
    </div>;
  return (
    <div className="">
      <div className="flex justify-between items-center w-full">
        {/* Left side - Filters */}
        <div className="flex-1">
          <Filter
            search={search}
            onSearchChange={onSearchChange}
            onSearchClear={onSearchClear}
            status={status}
            onStatusChange={onStatusChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={onPaymentMethodChange}
          />
        </div>

        
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests}
        isLoading={isLoading}
        showPagination={true}
        pageSize={10}
        withRowSelection
      />

      <BillDetailsSlideover
        billId={selectedBillId}
        open={detailsOpen}
        setOpen={setDetailsOpen}
      />
    </div>
  );
}
