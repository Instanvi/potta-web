'use client';
import { useMemo, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Input from '@potta/components/input';
import { formatAmount, formatDate, startOfMonth, today } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { useGeneralLedger } from '../hooks';
import { GeneralLedgerEntry } from '../utils/types';

const GeneralLedgerTab = () => {
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, isFetching, error, refetch } = useGeneralLedger({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    startDate: startDate || undefined,
    endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
  });

  const rows = data?.data ?? [];
  const pageTotals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          debit: acc.debit + Number(r.debitAmount ?? 0),
          credit: acc.credit + Number(r.creditAmount ?? 0),
        }),
        { debit: 0, credit: 0 }
      ),
    [rows]
  );

  const columns: ColumnDef<GeneralLedgerEntry>[] = [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.transactionDate),
    },
    { accessorKey: 'journalEntryNumber', header: 'Journal #' },
    { accessorKey: 'accountNumber', header: 'Account' },
    { accessorKey: 'accountName', header: 'Account name' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[280px]">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'debitAmount',
      header: 'Debit',
      cell: ({ row }) =>
        Number(row.original.debitAmount) ? formatAmount(row.original.debitAmount) : '',
    },
    {
      accessorKey: 'creditAmount',
      header: 'Credit',
      cell: ({ row }) =>
        Number(row.original.creditAmount) ? formatAmount(row.original.creditAmount) : '',
    },
    { accessorKey: 'sourceModule', header: 'Source' },
  ];

  const changeDate = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-44">
          <Input
            type="date"
            name="startDate"
            label="From"
            value={startDate}
            onchange={(e) => changeDate(setStartDate)(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Input
            type="date"
            name="endDate"
            label="To"
            value={endDate}
            onchange={(e) => changeDate(setEndDate)(e.target.value)}
          />
        </div>
        {isFetching && !isLoading && (
          <span className="text-sm text-gray-500 pb-3">Refreshing...</span>
        )}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No ledger entries in this period"
          description="Posted journal lines appear here once transactions are recorded."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            withRowSelection={false}
            manualPagination
            pageCount={data?.meta?.totalPages ?? 1}
            totalRows={data?.meta?.totalItems ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageSize={pagination.pageSize}
            pageSizeOptions={[20, 50, 100]}
          />
          <div className="flex justify-end gap-8 border-t border-gray-200 pt-3 mt-2 text-sm">
            <span className="text-gray-500">Page totals</span>
            <span>
              Debit <strong>{formatAmount(pageTotals.debit)}</strong>
            </span>
            <span>
              Credit <strong>{formatAmount(pageTotals.credit)}</strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneralLedgerTab;
