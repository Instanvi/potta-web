import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign, CreditCard } from 'lucide-react';
import Slider from '@potta/components/slideover';
import Button from '@potta/components/button';
import PaymentModal from './PaymentModal';
import { useGetApprovedBills } from '../hooks/useBills';
import { Bill } from '../utils/bills-api';

// Using the Bill interface from the API
type VendorInvoice = Bill;

const VendorInvoicesTable: React.FC = () => {
  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(
    null
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch approved bills from API
  const {
    data: billsData,
    isLoading,
    error,
  } = useGetApprovedBills({
    page,
    limit,
    sortBy: ['issuedDate:DESC'],
  });

  const bills = billsData?.data || [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter data based on search and filters - show approved and pending payment bills
  const filteredData = useMemo(() => {
    return bills.filter((bill) => {
      // Show approved bills and pending payment bills
      if (bill.status !== 'APPROVED' && bill.status !== 'PENDING_PAYMENT') {
        return false;
      }

      // Search filter
      const searchMatch =
        !searchValue ||
        (bill.invoiceType &&
          bill.invoiceType.toLowerCase().includes(searchValue.toLowerCase())) ||
        (bill.vendor?.name &&
          bill.vendor.name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (bill.customer?.name &&
          bill.customer.name
            .toLowerCase()
            .includes(searchValue.toLowerCase())) ||
        (bill.invoiceNumber &&
          bill.invoiceNumber
            .toLowerCase()
            .includes(searchValue.toLowerCase())) ||
        (bill.vendorInvoiceNumber &&
          bill.vendorInvoiceNumber
            .toLowerCase()
            .includes(searchValue.toLowerCase()));

      // Status filter (all approved bills should match)
      const statusMatch =
        statusFilter === 'all' || bill.status === statusFilter;

      // Date filter
      let dateMatch = true;
      if (dateFilter !== 'all' && bill.issuedDate) {
        const invoiceDate = new Date(bill.issuedDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (dateFilter) {
          case 'today':
            dateMatch = diffDays === 0;
            break;
          case 'week':
            dateMatch = diffDays <= 7;
            break;
          case 'month':
            dateMatch = diffDays <= 30;
            break;
          case 'quarter':
            dateMatch = diffDays <= 90;
            break;
        }
      }

      // Amount filter
      let amountMatch = true;
      if (amountFilter !== 'all') {
        const amount = bill.invoiceTotal;
        switch (amountFilter) {
          case 'low':
            amountMatch = amount < 1000;
            break;
          case 'medium':
            amountMatch = amount >= 1000 && amount < 5000;
            break;
          case 'high':
            amountMatch = amount >= 5000;
            break;
        }
      }

      return searchMatch && statusMatch && dateMatch && amountMatch;
    });
  }, [bills, searchValue, statusFilter, dateFilter, amountFilter]);

  // Filter configurations
  const filterConfig = [
    {
      key: 'date',
      label: 'Date',
      icon: <Calendar className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'This Quarter', value: 'quarter' },
      ],
      value: dateFilter,
      onChange: setDateFilter,
    },
    {
      key: 'amount',
      label: 'Amount',
      icon: <DollarSign className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Low (< €1,000)', value: 'low' },
        { label: 'Medium (€1,000 - €5,000)', value: 'medium' },
        { label: 'High (> €5,000)', value: 'high' },
      ],
      value: amountFilter,
      onChange: setAmountFilter,
    },
  ];

  const columns: ColumnDef<VendorInvoice>[] = [
    {
      accessorKey: 'invoiceType',
      header: 'Type',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('invoiceType') || 'Bill'}
        </div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => {
        const bill = row.original;
        const vendorName =
          bill.vendor?.name || bill.customer?.name || 'Unknown';
        return <div className="text-gray-900">{vendorName}</div>;
      },
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }) => {
        const bill = row.original;
        const invoiceNumber =
          bill.invoiceNumber ||
          bill.vendorInvoiceNumber ||
          bill.invoiceId ||
          '-';
        return (
          <div className="font-mono text-sm text-gray-600">{invoiceNumber}</div>
        );
      },
    },
    {
      accessorKey: 'issuedDate',
      header: 'Billing Date',
      cell: ({ row }) => {
        const date = row.getValue('issuedDate') as string;
        return (
          <div className="text-gray-900">{date ? formatDate(date) : '-'}</div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.getValue('dueDate') as string;
        return (
          <div className="text-gray-900">{date ? formatDate(date) : '-'}</div>
        );
      },
    },
    {
      accessorKey: 'invoiceTotal',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('invoiceTotal') as number;
        const currency = row.original.currency || 'XAF';
        return (
          <div className="text-gray-900 font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'APPROVED':
              return 'bg-green-100 text-green-800';
            case 'PENDING':
              return 'bg-yellow-100 text-yellow-800';
            case 'PENDING_PAYMENT':
              return 'bg-orange-100 text-orange-800';
            case 'REJECTED':
              return 'bg-red-100 text-red-800';
            case 'PAID':
              return 'bg-blue-100 text-blue-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const bill = row.original;
        const isPendingPayment = bill.status === 'PENDING_PAYMENT';
        return (
          <Button
            text="Pay"
            type="button"
            icon={<CreditCard className="w-3 h-3 mr-1" />}
            onClick={() => {
              setSelectedInvoice(bill);
              setIsPaymentModalOpen(true);
            }}
          />
        );
      },
    },
  ];

  const handleRowClick = (row: VendorInvoice) => {
    console.log('Clicked invoice:', row);
    // Handle row click - could open details modal, navigate to detail page, etc.
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading approved bills...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading bills. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-900">
            Approved Bills ({filteredData.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Bills that are approved and ready for payment
          </p>
        </div>

        {/* Dynamic Filters */}
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search invoices, vendors, or invoice numbers..."
          filters={filterConfig}
          className="mb-6"
        />

        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">No approved bills found.</div>
          </div>
        ) : (
          <DataGrid
            data={filteredData}
            columns={columns}
            onRowClick={handleRowClick}
            manualPagination={!!billsData?.meta}
            currentPage={page}
            pageSize={limit}
            pageCount={billsData?.meta?.totalPages || 1}
            totalItems={billsData?.meta?.totalItems || filteredData.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            showPagination={true}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        setIsOpen={setIsPaymentModalOpen}
        selectedInvoice={selectedInvoice}
      />
    </>
  );
};

export default VendorInvoicesTable;
