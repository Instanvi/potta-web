'use client';
import React, { useState } from 'react';
import { Button } from '@potta/components/shadcn/button';
import { Eye } from 'lucide-react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import useGetGeneralLedger from '../hooks/useGetGeneralLedger';
import CustomLoader from '@potta/components/loader';

const GeneralLedgerTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Get today's date in ISO format
  const today = new Date();
  const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: ledgerResponse, isLoading } = useGetGeneralLedger({
    page,
    limit,
    startDate,
    endDate,
  });

  const handleView = (entryId: string) => {
    // Implement view functionality if needed
  };

  const columns = [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }: { row: { original: any } }) =>
        new Date(row.original.transactionDate).toLocaleDateString(),
    },
    {
      accessorKey: 'accountNumber',
      header: 'Account Number',
      cell: ({ row }: { row: { original: any } }) => row.original.accountNumber,
    },
    {
      accessorKey: 'accountName',
      header: 'Account Name',
      cell: ({ row }: { row: { original: any } }) => row.original.accountName,
    },
    {
      accessorKey: 'debitAmount',
      header: 'Debit',
      cell: ({ row }: { row: { original: any } }) =>
        parseFloat(row.original.debitAmount).toFixed(2),
    },
    {
      accessorKey: 'creditAmount',
      header: 'Credit',
      cell: ({ row }: { row: { original: any } }) =>
        parseFloat(row.original.creditAmount).toFixed(2),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: { row: { original: any } }) => row.original.description,
    },
    {
      accessorKey: 'sourceModule',
      header: 'Source',
      cell: ({ row }: { row: { original: any } }) => row.original.sourceModule,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(row.original.uuid)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataGrid
      data={ledgerResponse?.data || []}
      columns={columns}
      loading={isLoading}
      progressComponent={<CustomLoader />}
    />
  );
};

export default GeneralLedgerTable;
