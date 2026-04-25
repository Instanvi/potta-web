import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign } from 'lucide-react';

interface CreditNote {
  id: string;
  title: string;
  type: string;
  beneficiary: string;
  creditNoteNumber: string;
  issueDate: string;
  dueDate: string;
  amountExclTax: number;
  amountInclTax: number;
  reason: string;
  status: string;
}

const CreditNotesTable: React.FC = () => {
  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  // Mock data - replace with actual API call
  const mockData: CreditNote[] = [
    {
      id: '1',
      title: 'Return Credit Note',
      type: 'Credit Note',
      beneficiary: 'Office Supplies Co.',
      creditNoteNumber: 'CN-2024-001',
      issueDate: '2024-01-10',
      dueDate: '2024-02-10',
      amountExclTax: -500.0,
      amountInclTax: -550.0,
      reason: 'Damaged goods return',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Discount Credit Note',
      type: 'Credit Note',
      beneficiary: 'Tech Solutions Ltd.',
      creditNoteNumber: 'CN-2024-002',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      amountExclTax: -250.0,
      amountInclTax: -275.0,
      reason: 'Early payment discount',
      status: 'approved',
    },
    {
      id: '3',
      title: 'Service Credit Note',
      type: 'Credit Note',
      beneficiary: 'Marketing Pro Agency',
      creditNoteNumber: 'CN-2024-003',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      amountExclTax: -750.0,
      amountInclTax: -825.0,
      reason: 'Service not delivered',
      status: 'pending',
    },
  ];

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

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return mockData.filter((creditNote) => {
      // Search filter
      const searchMatch =
        !searchValue ||
        creditNote.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        creditNote.beneficiary
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        creditNote.creditNoteNumber
          .toLowerCase()
          .includes(searchValue.toLowerCase());

      // Status filter
      const statusMatch =
        statusFilter === 'all' || creditNote.status === statusFilter;

      // Date filter
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const creditNoteDate = new Date(creditNote.issueDate);
        const now = new Date();
        const diffDays = Math.ceil(
          (now.getTime() - creditNoteDate.getTime()) / (1000 * 60 * 60 * 24)
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
        const amount = Math.abs(creditNote.amountInclTax);
        switch (amountFilter) {
          case 'low':
            amountMatch = amount < 500;
            break;
          case 'medium':
            amountMatch = amount >= 500 && amount < 1000;
            break;
          case 'high':
            amountMatch = amount >= 1000;
            break;
        }
      }

      return searchMatch && statusMatch && dateMatch && amountMatch;
    });
  }, [searchValue, statusFilter, dateFilter, amountFilter]);

  // Filter configurations
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      icon: <Filter className="w-4 h-4 text-gray-400" />,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
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
        { label: 'Low (< €500)', value: 'low' },
        { label: 'Medium (€500 - €1,000)', value: 'medium' },
        { label: 'High (> €1,000)', value: 'high' },
      ],
      value: amountFilter,
      onChange: setAmountFilter,
    },
  ];

  const columns: ColumnDef<CreditNote>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.getValue('type')}
        </span>
      ),
    },
    {
      accessorKey: 'beneficiary',
      header: 'Beneficiary',
      cell: ({ row }) => (
        <div className="text-gray-900">{row.getValue('beneficiary')}</div>
      ),
    },
    {
      accessorKey: 'creditNoteNumber',
      header: 'Credit Note Number',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-gray-600">
          {row.getValue('creditNoteNumber')}
        </div>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => (
        <div className="text-gray-900">
          {formatDate(row.getValue('issueDate'))}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="text-gray-900">
          {formatDate(row.getValue('dueDate'))}
        </div>
      ),
    },
    {
      accessorKey: 'amountExclTax',
      header: 'Amount (excl. tax)',
      cell: ({ row }) => {
        const amount = row.getValue('amountExclTax') as number;
        return (
          <div
            className={`font-medium ${
              amount < 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'amountInclTax',
      header: 'Amount (incl. tax)',
      cell: ({ row }) => {
        const amount = row.getValue('amountInclTax') as number;
        return (
          <div
            className={`font-medium ${
              amount < 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div
          className="text-sm text-gray-600 max-w-32 truncate"
          title={row.getValue('reason')}
        >
          {row.getValue('reason')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'approved':
              return 'bg-green-100 text-green-800';
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
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
  ];

  const handleRowClick = (row: CreditNote) => {
    console.log('Clicked credit note:', row);
    // Handle row click - could open details modal, navigate to detail page, etc.
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  return (
    <div className="bg-white p-6 ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Credit Notes</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredData.length} of {mockData.length} credit notes
          </span>
        </div>
      </div>

      {/* Dynamic Filters */}
      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        searchPlaceholder="Search credit notes, vendors, or credit note numbers..."
        filters={filterConfig}
        className="mb-6"
      />

      <DataGrid
        data={filteredData}
        columns={columns}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default CreditNotesTable;
