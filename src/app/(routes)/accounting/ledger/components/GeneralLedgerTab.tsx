'use client';
import { useMemo, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { formatAmount, formatDate, startOfMonth, today } from '../../../_shared/format';
import { EmptyState, ErrorState, StatCard } from '../../../_shared/states';
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

  const changeRange = ({ from, to }: DateRangeValue) => {
    setStartDate(from ?? '');
    setEndDate(to ?? '');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <DateRangePicker
          id="ledgerPeriod"
          label="Period"
          className="w-72"
          clearable
          value={{ from: startDate, to: endDate }}
          onChange={changeRange}
        />
        {isFetching && !isLoading && (
          <span className="pb-3 text-sm text-muted-foreground">Refreshing…</span>
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
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Entries in period" value={data?.meta?.totalItems ?? rows.length} />
            <StatCard label="Debit (this page)" value={formatAmount(pageTotals.debit)} />
            <StatCard label="Credit (this page)" value={formatAmount(pageTotals.credit)} />
          </div>
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
        </>
      )}
    </div>
  );
};

export default GeneralLedgerTab;
