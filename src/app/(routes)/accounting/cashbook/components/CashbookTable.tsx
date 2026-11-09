'use client';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount, formatDate, startOfMonth, today } from '../../../_shared/format';
import { EmptyState, ErrorState, StatCard, StatusBadge } from '../../../_shared/states';
import { useCashAccounts, useCashbookEntries, useDeleteCashbookEntry } from '../hooks';
import { CashbookDirection, CashbookEntry, CashbookFilter } from '../utils/types';
import CashbookEntrySheet from './CashbookEntrySheet';

const CashbookTable = () => {
  const { canAccess } = useCan();
  const [startDate, setStartDate] = useState(startOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [direction, setDirection] = useState<'' | CashbookDirection>('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [reference, setReference] = useState('');

  const filter: CashbookFilter = {
    startDate: startDate || undefined,
    endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
    direction: direction || undefined,
    cashAccountId: cashAccountId || undefined,
    reference: reference.trim() || undefined,
  };
  const { data, isLoading, error, refetch } = useCashbookEntries(filter);
  const { data: cashAccounts = [] } = useCashAccounts();
  const deleteMutation = useDeleteCashbookEntry();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CashbookEntry | null>(null);
  const [toDelete, setToDelete] = useState<CashbookEntry | null>(null);

  const rows = data?.data ?? [];
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          const amount = Number(r.amount ?? 0);
          if (r.direction === 'IN') acc.in += amount;
          else acc.out += amount;
          return acc;
        },
        { in: 0, out: 0 }
      ),
    [rows]
  );

  const columns: ColumnDef<CashbookEntry>[] = [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.transactionDate),
    },
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.direction === 'IN' ? 'success' : 'warning'}>
          {row.original.direction === 'IN' ? 'In' : 'Out'}
        </StatusBadge>
      ),
    },
    { accessorKey: 'entryType', header: 'Type' },
    {
      id: 'account',
      header: 'Account',
      cell: ({ row }) =>
        row.original.cashAccount
          ? `${row.original.cashAccount.code} · ${row.original.cashAccount.name}`
          : '—',
    },
    {
      accessorKey: 'counterparty',
      header: 'Counterparty',
      cell: ({ row }) => row.original.counterparty || '—',
    },
    {
      accessorKey: 'narration',
      header: 'Narration',
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[240px]">{row.original.narration || '—'}</span>
      ),
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => row.original.reference || '—',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className={`tabular-nums ${row.original.direction === 'IN' ? 'text-success' : 'text-destructive'}`}>
          {row.original.direction === 'IN' ? '+' : '−'}
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {canAccess('Cashbook', 'update') && (
            <button
              type="button"
              title="Edit"
              className="rounded-[2px] p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                setEditing(row.original);
                setSheetOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canAccess('Cashbook', 'remove') && (
            <button
              type="button"
              title="Delete"
              className="rounded-[2px] p-2 text-destructive hover:bg-destructive/10"
              onClick={() => setToDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input
              type="date"
              name="startDate"
              label="From"
              value={startDate}
              onchange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              name="endDate"
              label="To"
              value={endDate}
              onchange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Select
              label="Direction"
              options={[
                { value: '', label: 'All' },
                { value: 'IN', label: 'Money in' },
                { value: 'OUT', label: 'Money out' },
              ]}
              selectedValue={direction}
              onChange={(v: '' | CashbookDirection) => setDirection(v)}
              bg="bg-white"
            />
          </div>
          <div className="w-56">
            <Select
              label="Account"
              options={[
                { value: '', label: 'All accounts' },
                ...cashAccounts.map((a) => ({ value: a.uuid, label: `${a.code} · ${a.name}` })),
              ]}
              selectedValue={cashAccountId}
              onChange={(v: string) => setCashAccountId(v)}
              bg="bg-white"
            />
          </div>
          <div className="w-44">
            <Input
              type="text"
              name="reference"
              label="Reference"
              placeholder="Exact reference"
              value={reference}
              onchange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>
        <Can resource="Cashbook" action="create">
          <Button
            text="New entry"
            type="button"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          />
        </Can>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Money in (shown)" value={formatAmount(totals.in)} tone="success" />
        <StatCard label="Money out (shown)" value={formatAmount(totals.out)} tone="destructive" />
        <StatCard label="Net" value={formatAmount(totals.in - totals.out)} />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No cashbook entries"
          description="Record cash received or paid out; each entry posts a journal automatically."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            withRowSelection={false}
            pageSize={20}
            pageSizeOptions={[20]}
          />
          {data?.meta && data.meta.totalItems > rows.length && (
            <p className="text-xs text-muted-foreground">
              Showing the latest {rows.length} of {data.meta.totalItems} entries. Narrow the
              date range to see older entries.
            </p>
          )}
        </>
      )}

      <CashbookEntrySheet
        open={sheetOpen}
        entry={editing}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
      />
      <ConfirmModal
        open={!!toDelete}
        title="Delete cashbook entry"
        message="The entry is removed and a reversing journal entry is posted. Continue?"
        confirmText="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deleteMutation.mutate(toDelete.uuid, { onSuccess: () => setToDelete(null) })
        }
      />
    </div>
  );
};

export default CashbookTable;
