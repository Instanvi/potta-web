import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Filter, Calendar, DollarSign, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Button } from '@potta/components/shadcn/button';

interface ExpenseClaim {
  id: string;
  madeBy: string;
  merchant: string;
  amount: number;
  currency: string;
  memo: string;
  status: string;
  type: string;
  date: string;
}

const ExpenseClaimsTable: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  const mockData: ExpenseClaim[] = [
    {
      id: '1',
      madeBy: 'John Doe',
      merchant: 'Office Supplies Co.',
      amount: 1500,
      currency: 'XAF',
      memo: 'Office supplies for Q1',
      status: 'pending',
      type: 'office_supplies',
      date: '2024-01-15',
    },
    {
      id: '2',
      madeBy: 'Jane Smith',
      merchant: 'Tech Solutions Ltd.',
      amount: 2500,
      currency: 'XAF',
      memo: 'Software license renewal',
      status: 'approved',
      type: 'software_licenses',
      date: '2024-01-20',
    },
  ];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

  const filteredData = React.useMemo(() => {
    return mockData.filter((claim) => {
      const searchMatch =
        !searchValue ||
        claim.madeBy.toLowerCase().includes(searchValue.toLowerCase()) ||
        claim.merchant.toLowerCase().includes(searchValue.toLowerCase()) ||
        claim.memo.toLowerCase().includes(searchValue.toLowerCase());

      const statusMatch =
        statusFilter === 'all' || claim.status === statusFilter;

      let dateMatch = true;
      if (dateFilter !== 'all') {
        const claimDate = new Date(claim.date);
        const now = new Date();
        const diffDays = Math.ceil(
          (now.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24)
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
        const amount = claim.amount;
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
        { label: 'Low (< €1,000)', value: 'low' },
        { label: 'Medium (€1,000 - €5,000)', value: 'medium' },
        { label: 'High (> €5,000)', value: 'high' },
      ],
      value: amountFilter,
      onChange: setAmountFilter,
    },
  ];

  const columns: ColumnDef<ExpenseClaim>[] = [
    {
      accessorKey: 'madeBy',
      header: 'Employee',
      cell: ({ row: { original } }) => (
        <span className="font-medium">{original.madeBy}</span>
      ),
    },
    {
      accessorKey: 'merchant',
      header: 'Merchant',
      cell: ({ row: { original } }) => original.merchant,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <span className="font-medium">
          {formatCurrency(original.amount, original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'memo',
      header: 'Memo',
      cell: ({ row: { original } }) => original.memo,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => {
        let color = 'text-yellow-700';
        if (original.status?.toLowerCase() === 'approved')
          color = 'text-green-700';
        if (original.status?.toLowerCase() === 'rejected')
          color = 'text-red-700';
        return (
          <span className={`text-sm font-medium ${color}`}>
            {original.status?.charAt(0).toUpperCase() +
              original.status?.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Category',
      cell: ({ row: { original } }) => (
        <span className="capitalize">{original.type?.replace(/_/g, ' ')}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row: { original } }) => (
        <div className="text-gray-900">{formatDate(original.date)}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View:', original.id)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit:', original.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Approve:', original.id)}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Reject:', original.id)}
            >
              Reject
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => console.log('Delete:', original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Expense Claims</h2>
        <span className="text-sm text-gray-500">
          {filteredData.length} of {mockData.length} claims
        </span>
      </div>

      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        searchPlaceholder="Search employees, merchants, or memos..."
        filters={filterConfig}
        className="mb-6"
      />

      <DataGrid
        columns={columns}
        data={filteredData}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

export default ExpenseClaimsTable;
