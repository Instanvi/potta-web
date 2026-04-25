import React, { useEffect, useState } from 'react';
import MyTable from '@potta/components/table';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import moment from 'moment';
import { accountsApi } from '@potta/app/(routes)/accounting/utils/api';

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

  // Filtering logic
  let filteredData = transactions;
  if (search) {
    const s = search.toLowerCase();
    filteredData = filteredData.filter(
      (row: any) =>
        (row.description && row.description.toLowerCase().includes(s)) ||
        (row.referenceNumber && row.referenceNumber.toLowerCase().includes(s))
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

  const columns = [
    {
      name: 'Date',
      selector: (row: any) =>
        moment(row.transactionDate || row.date).format('ll, LT'),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: 'Description',
      selector: (row: any) => row.description,
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Withdrawals',
      selector: (row: any) => row.withdrawals || row.debit,
      sortable: true,
      minWidth: '120px',
      cell: (row: any) =>
        row.withdrawals || row.debit ? (
          <span className="text-red-600 font-medium">
            {row.withdrawals || row.debit}
          </span>
        ) : (
          ''
        ),
    },
    {
      name: 'Deposit',
      selector: (row: any) => row.deposit || row.credit,
      sortable: true,
      minWidth: '120px',
      cell: (row: any) =>
        row.deposit || row.credit ? (
          <span className="text-green-600 font-medium">
            {row.deposit || row.credit}
          </span>
        ) : (
          ''
        ),
    },
    {
      name: 'Balance',
      selector: (row: any) => row.balance,
      sortable: true,
      minWidth: '120px',
      cell: (row: any) => <span className="font-medium">{row.balance}</span>,
    },
    {
      name: '',
      selector: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-gray-100 hover:bg-opacity-50 outline-none p-1 rounded-full">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => alert('View Details')}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="mt-10">
      {loading ? (
        <div>Loading transactions...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <MyTable
          columns={columns}
          data={filteredData}
          ExpandableComponent={null}
          expanded={false}
          pagination={Array.isArray(filteredData) && filteredData.length > 9}
        />
      )}
    </div>
  );
};

export default BankAccountTable;
