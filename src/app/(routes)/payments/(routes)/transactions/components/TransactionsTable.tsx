'use client';
import React, { useState } from 'react';
import { DataTable } from '@potta/components/ui/data-table';
import CustomLoader from '@potta/components/loader';
import useGetAllTransactions from '../hooks/useGetAllTransaction';
import moment from 'moment';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import TransactionSlider from './TransactionSlider';

const statusColors = {
  completed: 'text-green-600 font-medium',
  failed: 'text-red-600 font-medium',
  pending: 'text-yellow-600 font-medium',
};

const methodIcons = {
  'Mobile Money': svgIcons.MOMO(),
};

interface TransactionsTableProps {
  search: string;
  status: string;
  dateRange: string;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  search,
  status,
  dateRange,
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const { data: ledgerResponse, isLoading } = useGetAllTransactions({
    page,
    limit,
  });

  const handleViewTransaction = (uuid: string) => {
    setSelectedUuid(uuid);
    setSliderOpen(true);
  };

  // Filtering logic
  let filteredData = ledgerResponse?.data || [];
  if (search) {
    const s = search.toLowerCase();
    filteredData = filteredData.filter(
      (row: any) =>
        (row.description && row.description.toLowerCase().includes(s)) ||
        (row.referenceNumber &&
          row.referenceNumber.toLowerCase().includes(s)) ||
        (row.transactionType && row.transactionType.toLowerCase().includes(s))
    );
  }
  if (status && status !== 'all') {
    filteredData = filteredData.filter(
      (row: any) => (row.status || '').toLowerCase() === status.toLowerCase()
    );
  }
  if (dateRange && dateRange !== 'All Time') {
    const now = moment();
    filteredData = filteredData.filter((row: any) => {
      const date = moment(row.transactionDate);
      if (dateRange === 'Yesterday')
        return date.isSame(now.clone().subtract(1, 'day'), 'day');
      if (dateRange === 'Last 7 Days')
        return date.isAfter(now.clone().subtract(7, 'days'));
      if (dateRange === 'Last 30 Days')
        return date.isAfter(now.clone().subtract(30, 'days'));
      return true;
    });
  }

  const columns = [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }: { row: { original: any } }) =>
        moment(row.original.transactionDate).format('ll, LT'),
    },
    {
      accessorKey: 'transactionId',
      header: 'Transaction ID',
      cell: ({ row }: { row: { original: any } }) => row.original.transactionId,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }: { row: { original: any } }) => (
        <span className="flex items-center">
          {methodIcons[row.original.paymentMethod] || null}
        </span>
      ),
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }: { row: { original: any } }) =>
        row.original.transactionType
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: { original: any } }) =>
        `${row.original.amount} ${row.original.currency}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => {
        const status = row.original.status?.toLowerCase();
        return (
          <span className={`${statusColors[status] || ''}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'referenceNumber',
      header: 'Reference',
      cell: ({ row }: { row: { original: any } }) =>
        row.original.referenceNumber || '-',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: { original: any } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-gray-100 hover:bg-opacity-50 outline-none p-1 rounded-full">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => handleViewTransaction(row.original.uuid)}
            >
              <span>View Transaction</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        progressComponent={<CustomLoader />}
        withRowSelection
      />
      <TransactionSlider
        open={sliderOpen}
        setOpen={setSliderOpen}
        uuid={selectedUuid}
      />
    </>
  );
};

export default TransactionsTable;
