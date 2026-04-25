'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import toast from 'react-hot-toast';
import { DataTable } from '@potta/components/ui/data-table';

import { IFilter } from '../_utils/types';
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import useGetAllInvoice from '../_hooks/useGetAllInvoice';
import useApproveInvoice from '../_hooks/useApproveInvoice';
import { useInvoiceFilter } from '../_context/InvoiceFilterContext';
import Button from '@potta/components/button';
import ModalInvoice from './modal';
import DynamicFilter from '@potta/components/dynamic-filter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import InvoiceViewModal from './InvoiceViewModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditInvoiceModal from './EditInvoiceModal';

// Define types based on the API response
interface LineItem {
  uuid: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountRate: number | null;
  discountAmount: number | null;
  discountType: string;
  discountCap: number;
}

interface Invoice {
  uuid: string;
  invoiceId: string;
  invoiceNumber?: string | null;
  code?: string;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  status: string;
  notes: string;
  currency: string;
  taxRate: number | null;
  taxAmount: number | null;
  paymentMethod: string;
  billingAddress: string;
  shippingAddress: string | null;
  paymentTerms: string | null;
  paymentReference: string | null;
  lineItems: LineItem[];
  rfqId?: string | null;
  spendRequestId?: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

const InvoiceTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:DESC');
  const [isOpen, setIsOpen] = useState(false);

  // Use shared filter context
  const { dateRange, statusFilter, setStatusFilter } = useInvoiceFilter();

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  const filter: IFilter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
  };

  const { data, isLoading, error } = useGetAllInvoice(filter);
  const approveInvoiceMutation = useApproveInvoice();

  // Cleanup modal states when component unmounts
  useEffect(() => {
    return () => {
      setViewModalOpen(false);
      setEditModalOpen(false);
      setDeleteModalOpen(false);
      setSelectedInvoice(null);
      setInvoiceToEdit(null);
      setInvoiceToDelete(null);
    };
  }, []);

  // Filter data based on search, status, and date range
  const filteredData = useMemo(() => {
    if (!data?.data) return [];

    // Filter to show only regular invoices (not proforma invoices)
    let filtered = data.data.filter(
      (invoice: Invoice) => invoice.invoiceType !== 'PROFORMA_INVOICE'
    );

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (invoice: Invoice) =>
          invoice.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by date range (from context)
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((invoice: Invoice) => {
        const invoiceDate = new Date(invoice.issuedDate);

        // Create date objects for comparison (ignore time)
        const invoiceDateOnly = new Date(
          invoiceDate.getFullYear(),
          invoiceDate.getMonth(),
          invoiceDate.getDate()
        );
        const fromDateOnly = new Date(
          dateRange.from!.getFullYear(),
          dateRange.from!.getMonth(),
          dateRange.from!.getDate()
        );
        const toDateOnly = new Date(
          dateRange.to!.getFullYear(),
          dateRange.to!.getMonth(),
          dateRange.to!.getDate()
        );

        console.log('Table filtering invoice:', {
          invoiceId: invoice.invoiceId,
          issuedDate: invoice.issuedDate,
          invoiceDateOnly: invoiceDateOnly.toISOString(),
          fromDateOnly: fromDateOnly.toISOString(),
          toDateOnly: toDateOnly.toISOString(),
          isInRange:
            invoiceDateOnly >= fromDateOnly && invoiceDateOnly <= toDateOnly,
        });

        return invoiceDateOnly >= fromDateOnly && invoiceDateOnly <= toDateOnly;
      });
    }

    // Filter by search value
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (invoice: Invoice) =>
          invoice.invoiceId.toLowerCase().includes(searchLower) ||
          (invoice.code && invoice.code.toLowerCase().includes(searchLower)) ||
          invoice.notes.toLowerCase().includes(searchLower) ||
          (invoice.customer &&
            `${invoice.customer.firstName} ${invoice.customer.lastName}`
              .toLowerCase()
              .includes(searchLower))
      );
    }

    return filtered;
  }, [data?.data, statusFilter, dateRange, searchValue]);

  const getStatusInfo = (status: string, dueDate?: string) => {
    const statusUpper = status.toUpperCase();
    const dueDateMoment = dueDate ? moment(dueDate) : null;
    const today = moment();

    switch (statusUpper) {
      case 'DRAFT':
        return {
          primary: 'Draft',
          secondary: 'Not issued',
          className: 'text-gray-600',
        };
      case 'ISSUED':
        return {
          primary: 'Issued',
          secondary: 'Pending approval',
          className: 'text-yellow-600',
        };
      case 'OVERDUE':
        return {
          primary: 'Overdue',
          secondary: dueDateMoment
            ? `Due ${dueDateMoment.format('MMM DD')}`
            : 'Past due',
          className: 'text-red-500',
        };
      case 'PAID':
        return {
          primary: 'Paid',
          secondary: 'Payment received',
          className: 'text-green-500',
        };
      case 'APPROVED':
        return {
          primary: 'Approved',
          secondary: 'Ready for payment',
          className: 'text-green-600',
        };
      case 'REJECTED':
        return {
          primary: 'Rejected',
          secondary: 'Not approved',
          className: 'text-red-600',
        };
      case 'ARCHIVED':
        return {
          primary: 'Archived',
          secondary: 'No longer active',
          className: 'text-gray-500',
        };
      default:
        return {
          primary: status,
          secondary: 'Unknown status',
          className: 'text-gray-600',
        };
    }
  };

  const getResolutionStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return {
          status: 'Paid',
          icon: <CheckCircle className="h-4 w-4" />,
          className: 'bg-green-50 text-green-700 border-green-500',
        };
      case 'APPROVED':
        return {
          status: 'Approved',
          icon: <CheckCircle className="h-4 w-4" />,
          className: 'bg-green-50 text-green-700 border-green-500',
        };
      case 'REJECTED':
        return {
          status: 'Rejected',
          icon: <XCircle className="h-4 w-4" />,
          className: 'bg-red-50 text-red-700 border-red-500',
        };
      case 'OVERDUE':
        return {
          status: 'Overdue',
          icon: <Clock className="h-4 w-4" />,
          className: 'bg-orange-50 text-orange-700 border-orange-500',
        };
      case 'ISSUED':
        return {
          status: 'Pending',
          icon: <Clock className="h-4 w-4" />,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-500',
        };
      case 'DRAFT':
        return {
          status: 'Draft',
          icon: <FileText className="h-4 w-4" />,
          className: 'bg-gray-50 text-gray-700 border-gray-500',
        };
      default:
        return {
          status: 'Unknown',
          icon: <FileText className="h-4 w-4" />,
          className: 'bg-gray-50 text-gray-700 border-gray-500',
        };
    }
  };

  const formatDate = (date: string) => {
    const momentDate = moment(date);
    const today = moment();

    if (momentDate.isSame(today, 'day')) {
      return 'Today';
    } else if (momentDate.isSame(today.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else if (momentDate.isAfter(today.clone().subtract(7, 'days'))) {
      return momentDate.format('dddd'); // Day name for recent dates
    } else {
      return momentDate.format('MMM DD, YYYY'); // Full date for older dates
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    const loadingToast = toast.loading('Approving invoice...');
    try {
      await approveInvoiceMutation.mutateAsync(invoiceId);
      toast.success('Invoice approved successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to approve invoice:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to approve invoice',
        {
          id: loadingToast,
        }
      );
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Ensure proper state initialization for animation
    setSelectedInvoice(invoice);
    // Small delay to ensure state is set before opening modal
    setTimeout(() => {
      setViewModalOpen(true);
    }, 10);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    // Ensure proper state initialization for animation
    setInvoiceToEdit(invoice);
    // Small delay to ensure state is set before opening modal
    setTimeout(() => {
      setEditModalOpen(true);
    }, 10);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    // Ensure proper state initialization for animation
    setInvoiceToDelete(invoice);
    // Small delay to ensure state is set before opening modal
    setTimeout(() => {
      setDeleteModalOpen(true);
    }, 10);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    const loadingToast = toast.loading('Deleting invoice...');
    try {
      // TODO: Implement delete API call
      console.log('Deleting invoice:', invoiceToDelete.uuid);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Invoice deleted successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice. Please try again.', {
        id: loadingToast,
      });
    }
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Draft', value: 'draft' },
        { label: 'Issued', value: 'issued' },
        { label: 'Paid', value: 'paid' },
        { label: 'Approved', value: 'approved' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Archived', value: 'archived' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      selectClassName: 'min-w-[120px]',
    },
  ];

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'issuedDate',
      header: 'Date',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-600">
          {formatDate(original.issuedDate)}
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row: { original } }) => {
        if (original.customer) {
          return (
            <div className="text-sm font-medium">
              {`${original.customer.firstName} ${original.customer.lastName}`}
            </div>
          );
        }
        return (
          <div className="text-sm font-medium text-gray-500">
            {original.invoiceType === 'PROFORMA_INVOICE'
              ? original.code || 'Proforma Invoice'
              : 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'invoiceId',
      header: 'ID',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-500">{original.invoiceId}</div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Title',
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.notes || 'No title'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => {
        const statusInfo = getStatusInfo(original.status, original.dueDate);
        return (
          <div className="flex flex-col">
            <div className={`text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.primary}
            </div>
            <div className="text-xs text-gray-400">{statusInfo.secondary}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'invoiceTotal',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <div className="text-sm">
          XAF{' '}
          {original.invoiceTotal.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      id: 'resolution',
      header: 'Resolution',
      cell: ({ row: { original } }) => {
        const resolution = getResolutionStatus(original.status);
        return (
          <div className="border-r pr-4 flex justify-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 border  ${resolution.className}`}
            >
              {resolution.icon}
              <span className="text-sm font-medium">{resolution.status}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: { original } }) => {
        const isIssued = original.status.toUpperCase() === 'ISSUED';

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewInvoice(original)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditInvoice(original)}>
                  Edit Invoice
                </DropdownMenuItem>
                {isIssued && (
                  <DropdownMenuItem
                    onClick={() => handleApproveInvoice(original.uuid)}
                    disabled={approveInvoiceMutation.isPending}
                  >
                    {approveInvoiceMutation.isPending
                      ? 'Approving...'
                      : 'Approve Invoice'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Download PDF for:', original.invoiceId);
                    toast.success('PDF download started!');
                  }}
                >
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteInvoice(original)}
                  className="text-red-600 focus:text-red-700"
                >
                  Delete Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center w-full">
        {/* Left side - Dynamic Filter */}
        <div className="flex-1">
          <DynamicFilter
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            searchPlaceholder="Search invoices by customer, ID, or title..."
            filters={filterConfig}
            className="p-0 bg-transparent"
          />
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            text={'Export'}
            icon={<i className="ri-upload-2-line"></i>}
            theme="lightBlue"
            type={'button'}
            color={true}
          />
          <Button
            text={'Create Invoice'}
            icon={<i className="ri-file-add-line"></i>}
            theme="default"
            type={'button'}
            onClick={() => {
              setIsOpen(true);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        withRowSelection
      />

      {/* Modals */}
      <ModalInvoice isOpen={isOpen} setIsOpen={setIsOpen} />

      <InvoiceViewModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        invoice={selectedInvoice}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={confirmDeleteInvoice}
        invoiceId={invoiceToDelete?.invoiceId || ''}
        customerName={
          invoiceToDelete && invoiceToDelete.customer
            ? `${invoiceToDelete.customer.firstName} ${invoiceToDelete.customer.lastName}`
            : invoiceToDelete?.invoiceType === 'PROFORMA_INVOICE'
            ? 'Proforma Invoice'
            : 'No Customer'
        }
        amount={invoiceToDelete?.invoiceTotal || 0}
        isLoading={false} // TODO: Add delete mutation loading state
      />

      <EditInvoiceModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        invoice={invoiceToEdit}
      />
    </div>
  );
};

export default InvoiceTable;
