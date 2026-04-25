import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign, Eye, CreditCard } from 'lucide-react';
import Button from '@potta/components/button';
import moment from 'moment';
import PaidInvoiceModal from './PaidInvoiceModal';
import { billsApi, Bill } from '../utils/bills-api';
import { useQuery } from '@tanstack/react-query';

interface PaidInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string;
  type: string;
  description: string;
  paymentMethod?: string;
}
const PaidInvoicesTable: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaidInvoice | null>(
    null
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch paid bills from API
  const {
    data: billsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['paid-bills', page, limit],
    queryFn: () => billsApi.getAll({ status: 'PAID', page, limit }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  // Transform API data to match component interface
  const paidBills: PaidInvoice[] = useMemo(() => {
    if (!billsData?.data) return [];

    return billsData.data.map((bill: Bill) => ({
      id: bill.uuid,
      invoiceNumber: bill.invoiceId || bill.invoiceNumber || '-',
      customerName: bill.vendor?.name || bill.customer?.name || '-',
      customerEmail: '', // Not available in bills API
      amount: bill.invoiceTotal,
      currency: bill.currency,
      status: bill.status.toLowerCase(),
      issueDate: bill.issuedDate || bill.createdAt || '',
      dueDate: bill.dueDate || '',
      paidDate: bill.updatedAt || '', // Use updatedAt as paid date
      type: bill.invoiceType || 'BILL',
      description: bill.notes || '',
      paymentMethod: bill.paymentMethod?.toLowerCase() || '',
    }));
  }, [billsData]);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'XAF') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredData = useMemo(() => {
    return paidBills.filter((invoice) => {
      const searchMatch =
        !searchValue ||
        invoice.customerName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        invoice.customerEmail
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase());

      let dateMatch = true;
      if (dateFilter !== 'all' && invoice.paidDate) {
        const paidDate = new Date(invoice.paidDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24)
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

      let amountMatch = true;
      if (amountFilter !== 'all') {
        const amount = invoice.amount;
        switch (amountFilter) {
          case 'low':
            amountMatch = amount < 10000;
            break;
          case 'medium':
            amountMatch = amount >= 10000 && amount < 50000;
            break;
          case 'high':
            amountMatch = amount >= 50000;
            break;
        }
      }

      return searchMatch && dateMatch && amountMatch;
    });
  }, [paidBills, searchValue, dateFilter, amountFilter]);

  const filterConfig = [
    {
      key: 'date',
      label: 'Paid Date',
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
        { label: 'Low (< 10,000 XAF)', value: 'low' },
        { label: 'Medium (10,000 - 50,000 XAF)', value: 'medium' },
        { label: 'High (> 50,000 XAF)', value: 'high' },
      ],
      value: amountFilter,
      onChange: setAmountFilter,
    },
  ];

  const columns: ColumnDef<PaidInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Bill Number',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-gray-900 font-medium">
          {row.getValue('invoiceNumber')}
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Vendor Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('customerName')}
        </div>
      ),
    },
    {
      accessorKey: 'customerEmail',
      header: 'Vendor Email',
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue('customerEmail')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {row.getValue('type')}
        </span>
      ),
    },
    {
      accessorKey: 'paidDate',
      header: 'Paid Date',
      cell: ({ row }) => (
        <div className="text-gray-900">
          {moment(row.getValue('paidDate')).format('MMM DD, YYYY')}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => {
        const paymentMethod = row.getValue('paymentMethod') as string;
        if (!paymentMethod) return <div className="text-gray-400">-</div>;

        return (
          <div className="flex items-center space-x-2">
            {paymentMethod === 'mtn' && (
              <img
                src="/icons/mtn.svg"
                alt="MTN Mobile Money"
                className="w-6 h-6"
              />
            )}
            {paymentMethod === 'orange' && (
              <img src="/icons/om.svg" alt="Orange Money" className="w-6 h-6" />
            )}
            <span className="text-sm text-gray-600">
              {paymentMethod === 'mtn'
                ? 'MTN Mobile Money'
                : paymentMethod === 'orange'
                ? 'Orange Money'
                : paymentMethod}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.getValue('amount'), row.original.currency)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          text="View"
          type="button"
          icon={<Eye className="w-3 h-3 mr-1" />}
          onClick={() => {
            setSelectedInvoice(row.original);
            setIsModalOpen(true);
          }}
        />
      ),
    },
  ];

  const handlePayClick = () => {
    console.log('Pay button clicked - redirect to payment page');
    // Add payment logic here
  };

  return (
    <div className="bg-white p-6 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Paid Bills</h2>
          <p className="text-sm text-gray-600 mt-1">
            Bills that have been approved and paid
          </p>
        </div>
        <Button
          text="Pay"
          type="button"
          icon={<CreditCard className="w-4 h-4 mr-1" />}
          onClick={handlePayClick}
        />
      </div>

      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        searchPlaceholder="Search paid bills, vendors..."
        filters={filterConfig}
        className="mb-6"
      />

      <DataGrid
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => console.log('Clicked:', row)}
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

      {/* Paid Invoice Modal */}
      <PaidInvoiceModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default PaidInvoicesTable;
