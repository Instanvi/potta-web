import MyTable from '@potta/components/table';
import React, { useState } from 'react';
import { useGetBudgetTransactions } from '../hooks/useGetBudgetTransactions';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import moment from 'moment';
import { MoreVertical } from 'lucide-react';
import BudgetTransactionSlider from './BudgetTransactionSlider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

const statusColors: Record<string, string> = {
  completed: 'text-green-600 font-medium',
  failed: 'text-red-600 font-medium',
  pending: 'text-yellow-600 font-medium',
};

interface BudgetTableProps {
  budgetId: string;
  search: string;
  status: string;
  dateRange: string;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  budgetId,
  search,
  status,
  dateRange,
}) => {
  const { data, isLoading, isError } = useGetBudgetTransactions({ budgetId });
  const [sliderOpen, setSliderOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setSliderOpen(true);
  };

  // Filtering logic
  let filteredData = data?.data || [];
  if (search) {
    const s = search.toLowerCase();
    filteredData = filteredData.filter(
      (row: any) =>
        (row.description && row.description.toLowerCase().includes(s)) ||
        (row.referenceNumber &&
          row.referenceNumber.toLowerCase().includes(s)) ||
        (row.category && row.category.toLowerCase().includes(s))
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
      name: 'Ref',
      selector: (row: any) => row.referenceNumber,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row: any) => (
        <span>
          {row.amount} {row.currency}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Method',
      selector: (row: any) => (
        <span className="flex items-center">
          {row.paymentMethod === 'Mobile Money' && svgIcons.MOMO()}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: any) => (
        <span
          style={{ textTransform: 'capitalize' }}
          className={statusColors[(row.status || '').toLowerCase()] || ''}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row: any) => moment(row.transactionDate).format('ll, LT'),
      sortable: true,
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
            <DropdownMenuItem onClick={() => handleViewDetails(row)}>
              <span>View Details</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="mt-10">
      {isLoading ? (
        <div>Loading transactions...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load transactions.</div>
      ) : (
        <>
          <MyTable
            columns={columns}
            data={filteredData}
            pagination={Array.isArray(filteredData) && filteredData.length > 9}
          />
          <BudgetTransactionSlider
            open={sliderOpen}
            setOpen={setSliderOpen}
            transaction={selectedTransaction}
          />
        </>
      )}
    </div>
  );
};

export default BudgetTable;
