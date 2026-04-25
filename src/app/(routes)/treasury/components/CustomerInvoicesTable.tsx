import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign, Eye } from 'lucide-react';
import Button from '@potta/components/button';
import moment from 'moment';
import InvoiceModal from './InvoiceModal';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  type: string;
  description: string;
  paymentMethod?: string;
}

const CustomerInvoicesTable: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<CustomerInvoice | null>(null);

  // Mock data - replace with actual API call
  const mockData: CustomerInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      amount: 25000.0,
      currency: 'XAF',
      status: 'pending',
      issueDate: '2024-01-15',
      dueDate: '2025-07-31',
      type: 'Service',
      description: 'Consulting services for Q1',
      paymentMethod: 'mtn',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@email.com',
      amount: 18000.0,
      currency: 'XAF',
      status: 'pending',
      issueDate: '2024-01-20',
      dueDate: '2025-08-02',
      type: 'Product',
      description: 'Software license renewal',
      paymentMethod: 'orange',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.wilson@email.com',
      amount: 32000.0,
      currency: 'XAF',
      status: 'pending',
      issueDate: '2024-01-10',
      dueDate: '2025-08-05',
      type: 'Service',
      description: 'Technical support services',
      paymentMethod: 'mtn',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      customerName: 'Emily Davis',
      customerEmail: 'emily.davis@email.com',
      amount: 15000.0,
      currency: 'XAF',
      status: 'overdue',
      issueDate: '2024-01-25',
      dueDate: '2025-02-25',
      type: 'Product',
      description: 'Hardware equipment',
      paymentMethod: 'orange',
    },
  ];

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

  const formatRemainingTime = (dueDate: string) => {
    const now = moment();
    const due = moment(dueDate);
    const diff = due.diff(now, 'days');

    if (diff < 0) {
      // Overdue
      const overdueDays = Math.abs(diff);
      if (overdueDays === 1) return '1 day overdue';
      if (overdueDays < 7) return `${overdueDays} days overdue`;
      if (overdueDays < 30)
        return `${Math.ceil(overdueDays / 7)} weeks overdue`;
      return `${Math.ceil(overdueDays / 30)} months overdue`;
    } else if (diff === 0) {
      return 'Due today';
    } else {
      // Due in the future
      if (diff === 1) return 'Due tomorrow';
      if (diff < 7) return `${diff} days`;
      if (diff < 30) return `${Math.ceil(diff / 7)} weeks`;
      return `${Math.ceil(diff / 30)} months`;
    }
  };

  const getRemainingTimeColor = (dueDate: string) => {
    const now = moment();
    const due = moment(dueDate);
    const diff = due.diff(now, 'days');

    if (diff < 0) return 'text-red-600 font-medium'; // Overdue
    if (diff <= 3) return 'text-orange-600 font-medium'; // Due soon
    if (diff <= 7) return 'text-yellow-600 font-medium'; // Due this week
    return 'text-gray-600'; // Normal
  };

  const filteredData = useMemo(() => {
    return mockData.filter((invoice) => {
      const searchMatch =
        !searchValue ||
        invoice.customerName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        invoice.customerEmail
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase());

      const statusMatch =
        statusFilter === 'all' || invoice.status === statusFilter;

      let dateMatch = true;
      if (dateFilter !== 'all') {
        const invoiceDate = new Date(invoice.issueDate);
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

      let amountMatch = true;
      if (amountFilter !== 'all') {
        const amount = invoice.amount;
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
  }, [searchValue, statusFilter, dateFilter, amountFilter]);

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      icon: <Filter className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'date',
      label: 'Issue Date',
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

  const columns: ColumnDef<CustomerInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-gray-900 font-medium">
          {row.getValue('invoiceNumber')}
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('customerName')}
        </div>
      ),
    },
    {
      accessorKey: 'customerEmail',
      header: 'Customer Email',
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue('customerEmail')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'sent':
              return 'bg-blue-100 text-blue-800';
            case 'paid':
              return 'bg-green-100 text-green-800';
            case 'overdue':
              return 'bg-red-100 text-red-800';
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
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
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
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div
          className={`text-sm ${getRemainingTimeColor(
            row.getValue('dueDate')
          )}`}
        >
          {formatRemainingTime(row.getValue('dueDate'))}
        </div>
      ),
    },
    // {
    //   accessorKey: 'paymentMethod',
    //   header: 'Payment Method',
    //   cell: ({ row }) => {
    //     const paymentMethod = row.getValue('paymentMethod') as string;
    //     if (!paymentMethod) return <div className="text-gray-400">-</div>;

    //     return (
    //       <div className="flex items-center space-x-2">
    //         {paymentMethod === 'mtn' && (
    //           <img
    //             src="/icons/mtn.svg"
    //             alt="MTN Mobile Money"
    //             className="w-6 h-6"
    //           />
    //         )}
    //         {paymentMethod === 'orange' && (
    //           <img src="/icons/om.svg" alt="Orange Money" className="w-6 h-6" />
    //         )}
    //         <span className="text-sm text-gray-600">
    //           {paymentMethod === 'mtn'
    //             ? 'MTN Mobile Money'
    //             : paymentMethod === 'orange'
    //             ? 'Orange Money'
    //             : paymentMethod}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
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

  return (
    <div className="bg-white p-6 ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Customer Invoices
        </h2>
      </div>

      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        searchPlaceholder="Search invoices, customers..."
        filters={filterConfig}
        className="mb-6"
      />

      <DataGrid
        data={filteredData}
        columns={columns}
        onRowClick={(row) => console.log('Clicked:', row)}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default CustomerInvoicesTable;
