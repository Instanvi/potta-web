'use client';
import { useMemo, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Search from '@potta/components/search';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { formatAmount, formatDate, startOfMonth, today } from '../../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, StatCard } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useGeneralLedger } from '../hooks';
import { GeneralLedgerEntry } from '../utils/types';

const GeneralLedgerTab = () => {
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
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

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.data ?? []).filter((row) => {
      if (sourceFilter !== 'all' && (row.sourceModule || '') !== sourceFilter) return false;
      if (!q) return true;
      return [
        row.journalEntryNumber,
        row.accountNumber,
        row.accountName,
        row.description,
        row.sourceModule,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data?.data, search, sourceFilter]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    (data?.data ?? []).forEach((r) => {
      if (r.sourceModule) set.add(r.sourceModule);
    });
    return Array.from(set).sort();
  }, [data?.data]);
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
      <ListToolbar
        actions={
          <ExportButton
            filename="general-ledger"
            rows={rows}
            columns={[
              {
                key: 'transactionDate',
                header: 'Date',
                value: (row) => formatDate(row.transactionDate),
              },
              { key: 'journalEntryNumber', header: 'Journal #' },
              { key: 'accountNumber', header: 'Account' },
              { key: 'accountName', header: 'Account name' },
              { key: 'description', header: 'Description' },
              {
                key: 'debitAmount',
                header: 'Debit',
                value: (row) =>
                  Number(row.debitAmount) ? formatAmount(row.debitAmount) : '',
              },
              {
                key: 'creditAmount',
                header: 'Credit',
                value: (row) =>
                  Number(row.creditAmount) ? formatAmount(row.creditAmount) : '',
              },
              { key: 'sourceModule', header: 'Source' },
            ]}
          />
        }
      >
        <DateRangePicker
          id="ledgerPeriod"
          className="w-72"
          clearable
          value={{ from: startDate, to: endDate }}
          onChange={changeRange}
        />
        <Search
          placeholder="Search journal, account, description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="w-full max-w-sm"
        />
        <select
          className="h-10 w-44 shrink-0 rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-white px-3 text-sm leading-none text-foreground shadow-none outline-none transition-colors focus-visible:border-primary focus-visible:ring-0"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {isFetching && !isLoading && (
          <span className="pb-2.5 text-sm text-muted-foreground">Refreshing…</span>
        )}
      </ListToolbar>

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
            manualPagination={!search && sourceFilter === 'all'}
            pageCount={
              search || sourceFilter !== 'all' ? undefined : (data?.meta?.totalPages ?? 1)
            }
            totalRows={
              search || sourceFilter !== 'all' ? rows.length : (data?.meta?.totalItems ?? 0)
            }
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
