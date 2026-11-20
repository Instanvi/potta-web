import React, { useState } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { useGetAssets } from '../hooks/useGetAssets';
import ViewAssetModal from './ViewAssetModal';
import EditAssetSlideover from './EditAssetSlideover';
import DisposeAssetModal from './DisposeAssetModal';
import DeleteAssetModal from './DeleteAssetModal';
import { IColumnDef } from '@potta/app/(routes)/account_receivables/credit/_utils/types';

const AssetTable = () => {
  const { data, isLoading, refetch } = useGetAssets();
  const assets = data?.data || [];

  // Modal state
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [disposeId, setDisposeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: IColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Asset Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'asset_type',
      header: 'Type',
      cell: ({ row }) => row.original.asset_type,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let color = 'bg-gray-100 text-gray-700';
        if (status === 'Active') color = 'text-green-600';
        else if (status === 'Inactive') color = ' text-yellow-600';
        else if (status === 'Decommissioned') color = ' text-red-600';
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-md font-medium ${color}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'salvage_value',
      header: 'Salvage Value',
      cell: ({ row }) => {
        const val = row.original.salvage_value;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return num != null && !isNaN(num) ? `XAF ${num.toLocaleString()}` : '-';
      },
    },
    {
      accessorKey: 'acquisition_cost',
      header: 'Acquisition Cost',
      cell: ({ row }) => {
        const val = row.original.acquisition_cost;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return num != null && !isNaN(num) ? `XAF ${num.toLocaleString()}` : '-';
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location,
    },
    {
      accessorKey: 'acquisition_date',
      header: 'Acquisition Date',
      cell: ({ row }) => row.original.acquisition_date || '-',
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
            <DropdownMenuItem onClick={() => setEditId(row.original.uuid)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDisposeId(row.original.uuid)}>
              Dispose
            </DropdownMenuItem>
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
      <DataGrid data={assets} columns={columns} loading={isLoading} />
      {/* Modals/Slideover */}
      <ViewAssetModal
        open={!!viewId}
        setOpen={() => setViewId(null)}
        assetId={viewId || ''}
      />
      <EditAssetSlideover
        open={!!editId}
        setOpen={() => {
          setEditId(null);
          refetch();
        }}
        assetId={editId || ''}
      />
      {disposeId && (
        <DisposeAssetModal
          open={!!disposeId}
          setOpen={() => {
            setDisposeId(null);
            refetch();
          }}
          assetId={disposeId}
          onDisposed={refetch}
        />
      )}
      {deleteId && (
        <DeleteAssetModal
          open={!!deleteId}
          setOpen={() => {
            setDeleteId(null);
            refetch();
          }}
          assetId={deleteId}
          onDeleted={refetch}
        />
      )}
    </>
  );
};

export default AssetTable;
