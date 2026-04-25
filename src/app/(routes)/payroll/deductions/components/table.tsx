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
import { useDeductions } from '../hooks/useDeductions';
import ViewDeductionModal from './ViewDeductionModal';
// import EditDeductionSlideover from './EditDeductionSlideover';
// import DeleteDeductionModal from './DeleteDeductionModal';

const DeductionTable = () => {
  const { data, isLoading, refetch } = useDeductions({ page: 1, limit: 20 });
  const deductions = data?.data || [];

  // Modal state
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: IColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => row.original.type,
    },
    {
      accessorKey: 'mode',
      header: 'Mode',
      cell: ({ row }) => row.original.mode,
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => row.original.value,
    },
    {
      accessorKey: 'is_tax',
      header: 'Is Tax',
      cell: ({ row }) => (row.original.is_tax ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'applies_to',
      header: 'Applies To',
      cell: ({ row }) => row.original.applies_to,
    },
    {
      accessorKey: 'is_active',
      header: 'Active',
      cell: ({ row }) =>
        row.original.is_active ? (
          <span className="text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-red-600 font-medium">Inactive</span>
        ),
    },
    {
      accessorKey: 'is_editable',
      header: 'Editable',
      cell: ({ row }) => (row.original.is_editable ? 'Yes' : 'No'),
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
            <DropdownMenuItem onClick={() => setViewId(row.original.uuid)}>
              View
            </DropdownMenuItem>
            {row.original.is_editable && (
              <DropdownMenuItem onClick={() => setEditId(row.original.uuid)}>
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setDeleteId(row.original.uuid)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataGrid data={deductions} columns={columns} loading={isLoading} />

      {/* View Deduction Modal */}
      <ViewDeductionModal
        open={!!viewId}
        setOpen={(open) => !open && setViewId(null)}
        deductionId={viewId}
      />

      {/* Modals/Slideover for edit, delete will go here */}
    </>
  );
};

export default DeductionTable;
