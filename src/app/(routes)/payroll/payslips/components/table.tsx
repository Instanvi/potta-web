import React, { useState } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { IColumnDef } from '@potta/app/(routes)/account_receivables/_utils/types';
import { EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
// import { usePayslips } from '../hooks/usePayslips'; // To be implemented
// import ViewPayslipModal from './ViewPayslipModal';
// import AddPayslipSlideover from './AddPayslipSlideover';

const dummyPayslips = [
  {
    id: '1',
    employee: 'John Doe',
    period: '2024-05',
    status: 'Unpaid',
    amount: 1200,
    created_at: '2024-05-01',
  },
];

const PayslipTable = () => {
  // const { data, isLoading, refetch } = usePayslips({ page: 1, limit: 20 });
  // const payslips = data?.data || [];
  const payslips = dummyPayslips;
  const isLoading = false;

  // Modal state
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: IColumnDef<any>[] = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }) => row.original.employee,
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }) => row.original.period,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={
            row.original.status === 'Paid'
              ? 'text-green-600'
              : 'text-yellow-600'
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `XAF ${row.original.amount}`,
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => row.original.created_at,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-100 focus:outline-none">
              <EllipsisVertical className="h-5 w-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewId(row.original.id)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Mark as Paid')}>
              Mark as Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('Export')}>
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataGrid data={payslips} column={columns} loading={isLoading} />
      {/* Modals/Slideover for view, add, etc. will go here */}
    </>
  );
};

export default PayslipTable;
