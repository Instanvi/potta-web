import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import moment from 'moment';
import { accountsApi } from '@potta/app/(routes)/accounting/utils/api';
import { DataTable } from '@potta/components/ui/data-table';
import { ErrorState } from '../../../../_shared/states';

interface BankAccountTableProps {
  ledgerAccountId: string;
  search: string;
  status: string;
  dateRange: string;
}

const BankAccountTable: React.FC<BankAccountTableProps> = ({
  ledgerAccountId,
  search,
  status,
  dateRange,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ledgerAccountId) return;
    setLoading(true);
    setError(null);
    accountsApi
      .getTransactions(ledgerAccountId)
      .then((data: any) => {
        setTransactions(data?.data || []);
      })
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [ledgerAccountId]);

  const filteredData = useMemo(() => {
    let rows = transactions;
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (row: any) =>
          (row.description && row.description.toLowerCase().includes(s)) ||
          (row.referenceNumber && row.referenceNumber.toLowerCase().includes(s))
      );
    }
    if (status && status !== 'all') {
      rows = rows.filter(
        (row: any) => (row.status || '').toLowerCase() === status.toLowerCase()
      );
    }
    if (dateRange && dateRange !== 'All Time') {
      const now = moment();
      rows = rows.filter((row: any) => {
        const date = moment(row.transactionDate || row.date);
        if (dateRange === 'Yesterday')
          return date.isSame(now.clone().subtract(1, 'day'), 'day');
        if (dateRange === 'Last 7 Days')
          return date.isAfter(now.clone().subtract(7, 'days'));
        if (dateRange === 'Last 30 Days')
          return date.isAfter(now.clone().subtract(30, 'days'));
        return true;
      });
    }
    return rows;
  }, [transactions, search, status, dateRange]);

  const columns: ColumnDef<any>[] = [
    {
      id: 'date',
      header: 'Date',
      accessorFn: (row) => row.transactionDate || row.date,
      cell: ({ row: { original } }) =>
        moment(original.transactionDate || original.date).format('ll, LT'),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      id: 'withdrawals',
      header: 'Withdrawals',
      accessorFn: (row) => row.withdrawals || row.debit,
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-medium text-destructive">{getValue() as React.ReactNode}</span>
        ) : (
          ''
        ),
    },
    {
      id: 'deposit',
      header: 'Deposit',
      accessorFn: (row) => row.deposit || row.credit,
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="font-medium text-success">{getValue() as React.ReactNode}</span>
        ) : (
          ''
        ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row: { original } }) => <span className="font-medium">{original.balance}</span>,
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1 outline-none hover:bg-accent">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => alert('View Details')}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) return <ErrorState error={new Error(error)} />;

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={loading}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
};

export default BankAccountTable;
