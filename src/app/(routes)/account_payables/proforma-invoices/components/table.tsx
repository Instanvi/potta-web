'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import toast from 'react-hot-toast';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { IFilter } from '../../../account_receivables/invoice/_utils/types';
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import useGetAllInvoice from '../../../account_receivables/invoice/_hooks/useGetAllInvoice';
import useApproveProformaInvoice from '../hooks/useApproveProformaInvoice';
import useRejectProformaInvoice from '../hooks/useRejectProformaInvoice';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import InvoiceViewModal from '../../../account_receivables/invoice/components/InvoiceViewModal';
import DeleteConfirmModal from '../../../account_receivables/invoice/components/DeleteConfirmModal';

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

interface ProformaInvoice {
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

const ProformaInvoiceTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:DESC');

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<ProformaInvoice | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<ProformaInvoice | null>(null);

  const filter: IFilter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
  };

  const { data, isLoading, error } = useGetAllInvoice(filter);
  const approveMutation = useApproveProformaInvoice();
  const rejectMutation = useRejectProformaInvoice();

  // Cleanup modal states when component unmounts
  useEffect(() => {
    return () => {
      setViewModalOpen(false);
      setDeleteModalOpen(false);
      setSelectedInvoice(null);
      setInvoiceToDelete(null);
    };
  }, []);

  // Filter data to show only proforma invoices
  const filteredData = useMemo(() => {
    if (!data?.data) return [];

    // Filter to show only proforma invoices
    let filtered = data.data.filter(
      (invoice: ProformaInvoice) => invoice.invoiceType === 'PROFORMA_INVOICE'
    );

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (invoice: ProformaInvoice) =>
          invoice.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search value
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (invoice: ProformaInvoice) =>
          invoice.invoiceId.toLowerCase().includes(searchLower) ||
          (invoice.code && invoice.code.toLowerCase().includes(searchLower)) ||
          invoice.notes.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [data?.data, statusFilter, searchValue]);

  const getStatusInfo = (status: string) => {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'DRAFT':
        return {
          primary: 'Draft',
          secondary: 'Not issued',
          className: 'text-gray-600',
        };
      case 'ISSUED':
        return {
          primary: 'Submitted',
          secondary: 'Pending review',
          className: 'text-yellow-600',
        };
      case 'APPROVED':
        return {
          primary: 'Approved',
          secondary: 'Ready to convert',
          className: 'text-green-600',
        };
      case 'REJECTED':
        return {
          primary: 'Rejected',
          secondary: 'Not approved',
          className: 'text-red-600',
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
      return momentDate.format('dddd');
    } else {
      return momentDate.format('MMM DD, YYYY');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const handleViewInvoice = (invoice: ProformaInvoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      setViewModalOpen(true);
    }, 10);
  };

  const handleDeleteInvoice = (invoice: ProformaInvoice) => {
    setInvoiceToDelete(invoice);
    setTimeout(() => {
      setDeleteModalOpen(true);
    }, 10);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    const loadingToast = toast.loading('Deleting proforma invoice...');
    try {
      // TODO: Implement delete API call
      console.log('Deleting proforma invoice:', invoiceToDelete.uuid);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Proforma invoice deleted successfully!', {
        id: loadingToast,
      });
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      console.error('Failed to delete proforma invoice:', error);
      toast.error('Failed to delete proforma invoice. Please try again.', {
        id: loadingToast,
      });
    }
  };

  const handleApproveInvoice = async (invoice: ProformaInvoice) => {
    const loadingToast = toast.loading('Approving proforma invoice...');
    try {
      await approveMutation.mutateAsync(invoice.uuid);
      toast.success('Proforma invoice approved successfully!', {
        id: loadingToast,
      });
    } catch (error: any) {
      console.error('Failed to approve proforma invoice:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to approve proforma invoice',
        {
          id: loadingToast,
        }
      );
    }
  };

  const handleRejectInvoice = async (invoice: ProformaInvoice) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const loadingToast = toast.loading('Rejecting proforma invoice...');
    try {
      await rejectMutation.mutateAsync({ id: invoice.uuid, reason });
      toast.success('Proforma invoice rejected successfully!', {
        id: loadingToast,
      });
    } catch (error: any) {
      console.error('Failed to reject proforma invoice:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to reject proforma invoice',
        {
          id: loadingToast,
        }
      );
    }
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'issued' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      selectClassName: 'min-w-[120px]',
    },
  ];

  const columns: ColumnDef<ProformaInvoice>[] = [
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
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row: { original } }) => (
        <div className="text-sm font-medium">{original.code || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'invoiceId',
      header: 'Invoice ID',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-500">{original.invoiceId}</div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Description',
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.notes || 'No description'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => {
        const statusInfo = getStatusInfo(original.status);
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
          {original.currency}{' '}
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
              className={`flex items-center gap-2 px-3 py-2 border ${resolution.className}`}
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
      header: 'Actions',
      cell: ({ row: { original } }) => {
        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewInvoice(original)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {original.status === 'ISSUED' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleApproveInvoice(original)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRejectInvoice(original)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => handleDeleteInvoice(original)}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Delete
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
            searchPlaceholder="Search proforma invoices by code, ID, or description..."
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
        </div>
      </div>

      <DataGrid columns={columns} data={filteredData} isLoading={isLoading} />

      {/* Modals */}
      <InvoiceViewModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        invoice={selectedInvoice as any}
        
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onConfirm={confirmDeleteInvoice}
        invoiceId={invoiceToDelete?.invoiceId || ''}
        customerName={invoiceToDelete?.code || 'Proforma Invoice'}
        amount={invoiceToDelete?.invoiceTotal || 0}
        isLoading={false}
      />
    </div>
  );
};

export default ProformaInvoiceTable;
