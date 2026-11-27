'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { ListActionsMenu, ListActionItem } from '@/components/list-actions-menu';
import { RowActionMenu } from '@/components/row-action-menu';
import { useServerPagination } from '@/hooks/use-server-pagination';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount, formatDateTime } from '../../../_shared/format';
import { ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import {
  useAcceptIntegrationTransaction,
  useExcludeIntegrationTransaction,
  useIntegrationTransactions,
} from '../hooks';
import {
  IntegrationSource,
  IntegrationStatus,
  IntegrationTransaction,
} from '../utils/types';

const STATUS_TONE: Record<IntegrationStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  new: 'warning',
  reviewed: 'neutral',
  posted: 'success',
  excluded: 'danger',
};

const SOURCE_LABEL: Record<IntegrationSource, string> = {
  pay: 'Pay',
  expense: 'Expense',
  pos: 'POS',
  other: 'Other',
};

const IntegrationTransactionsTable = () => {
  const { canAccess } = useCan();
  const [status, setStatus] = useState<'' | IntegrationStatus>('new');
  const [source, setSource] = useState<'' | IntegrationSource>('');
  const [search, setSearch] = useState('');
  const [toAccept, setToAccept] = useState<IntegrationTransaction | null>(null);
  const [toExclude, setToExclude] = useState<IntegrationTransaction | null>(null);
  const [debitCode, setDebitCode] = useState('');
  const [creditCode, setCreditCode] = useState('');

  const openAccept = (row: IntegrationTransaction) => {
    setDebitCode(row.matchedDebitAccountCode ?? '');
    setCreditCode(row.matchedCreditAccountCode ?? '');
    setToAccept(row);
  };

  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [status, source, search],
  });

  const filter = {
    page,
    limit,
    sortBy: 'createdAt:DESC',
    status: status || undefined,
    source: source || undefined,
    search: search.trim() || undefined,
  };

  const { data, isLoading, isFetching, error, refetch } = useIntegrationTransactions(filter);
  const acceptMutation = useAcceptIntegrationTransaction();
  const excludeMutation = useExcludeIntegrationTransaction();

  const rows = data?.data ?? [];

  const { table, onTableChange } = useDataTableHandle<IntegrationTransaction>();
  const columns: ColumnDef<IntegrationTransaction>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Received',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <StatusBadge tone="neutral">{SOURCE_LABEL[row.original.source] ?? row.original.source}</StatusBadge>
      ),
    },
    {
      accessorKey: 'externalId',
      header: 'External ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.externalId}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[240px]">{row.original.description || '—'}</span>
      ),
    },
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.direction === 'in' ? 'success' : 'warning'}>
          {row.original.direction === 'in' ? 'In' : 'Out'}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span
          className={`tabular-nums ${
            row.original.direction === 'in' ? 'text-success' : 'text-destructive'
          }`}
        >
          {row.original.direction === 'in' ? '+' : '−'}
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge tone={STATUS_TONE[row.original.status]}>
          {row.original.status}
          {row.original.journalEntryNumber ? ` · ${row.original.journalEntryNumber}` : ''}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      header: '',
      cell: ({ row }) => {
        const txn = row.original;
        const actionable = txn.status === 'new' || txn.status === 'reviewed';
        if (!actionable) return null;
        return (
          <RowActionMenu
            label="Transaction actions"
            items={
              canAccess('JournalEntries', 'create')
                ? [
                    {
                      label: 'Accept',
                      icon: <Check className="mr-2 h-4 w-4" />,
                      onSelect: () => openAccept(txn),
                    },
                    {
                      label: 'Exclude',
                      icon: <X className="mr-2 h-4 w-4" />,
                      destructive: true,
                      onSelect: () => setToExclude(txn),
                    },
                  ]
                : []
            }
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        actions={
          <>
            <ListActionsMenu table={table}>
            <ExportButton
              asItem
              filename="integration-transactions"
              rows={rows}
              columns={[
                {
                  key: 'createdAt',
                  header: 'Received',
                  value: (row) => formatDateTime(row.createdAt),
                },
                {
                  key: 'source',
                  header: 'Source',
                  value: (row) => SOURCE_LABEL[row.source] ?? row.source,
                },
                { key: 'externalId', header: 'External ID' },
                {
                  key: 'description',
                  header: 'Description',
                  value: (row) => row.description || '',
                },
                {
                  key: 'direction',
                  header: 'Direction',
                  value: (row) => (row.direction === 'in' ? 'In' : 'Out'),
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  value: (row) =>
                    `${row.direction === 'in' ? '+' : '−'}${formatAmount(row.amount, row.currency)}`,
                },
                {
                  key: 'status',
                  header: 'Status',
                  value: (row) =>
                    row.journalEntryNumber
                      ? `${row.status} · ${row.journalEntryNumber}`
                      : row.status,
                },
              ]}
            />
            <ListActionItem
              label="Refresh"
              disabled={isFetching}
              icon={<ArrowsClockwise className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} weight="bold" />}
              onSelect={() => void refetch()}
            />
            </ListActionsMenu>
          </>
        }
      >
        <div className="w-40">
          <Select
            label="Status"
            options={[
              { value: '', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'posted', label: 'Posted' },
              { value: 'excluded', label: 'Excluded' },
            ]}
            selectedValue={status}
            onChange={(v: '' | IntegrationStatus) => setStatus(v)}
            bg="bg-white"
          />
        </div>
        <div className="w-40">
          <Select
            label="Source"
            options={[
              { value: '', label: 'All' },
              { value: 'pay', label: 'Pay' },
              { value: 'expense', label: 'Expense' },
              { value: 'pos', label: 'POS' },
              { value: 'other', label: 'Other' },
            ]}
            selectedValue={source}
            onChange={(v: '' | IntegrationSource) => setSource(v)}
            bg="bg-white"
          />
        </div>
        <div className="w-56">
          <Input
            type="text"
            name="search"
            label="Search"
            placeholder="External id or description"
            value={search}
            onchange={(e) => setSearch(e.target.value)}
          />
        </div>
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          onTableChange={onTableChange}
          emptyMessage="No integration transactions"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          pageSizeOptions={[20, 50, 100]}
          {...tableProps(data?.meta, rows.length)}
        
          storageKey="integration-transactions-table"
        />
      )}

      <ConfirmModal
        open={!!toAccept}
        title="Accept integration transaction"
        message={
          toAccept ? (
            <div className="space-y-3">
              <p>
                Post a journal for {SOURCE_LABEL[toAccept.source]}{' '}
                <span className="font-mono text-xs">{toAccept.externalId}</span> (
                {formatAmount(toAccept.amount, toAccept.currency)}). Enter OHADA account codes if the
                payload has no lines.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  name="debitCode"
                  label="Debit account code"
                  placeholder="e.g. 521"
                  value={debitCode}
                  onchange={(e) => setDebitCode(e.target.value.trim())}
                />
                <Input
                  type="text"
                  name="creditCode"
                  label="Credit account code"
                  placeholder="e.g. 411"
                  value={creditCode}
                  onchange={(e) => setCreditCode(e.target.value.trim())}
                />
              </div>
            </div>
          ) : (
            ''
          )
        }
        confirmText="Accept"
        isLoading={acceptMutation.isPending}
        onClose={() => setToAccept(null)}
        onConfirm={() => {
          if (!toAccept) return;
          const hasPayloadLines =
            Array.isArray(toAccept.payload?.lines) && toAccept.payload.lines.length > 0;
          if (!hasPayloadLines && (!debitCode || !creditCode)) {
            toast.error('Enter debit and credit account codes to post.');
            return;
          }
          acceptMutation.mutate(
            {
              id: toAccept.id,
              body: {
                matchedDebitAccountCode: debitCode || undefined,
                matchedCreditAccountCode: creditCode || undefined,
              },
            },
            { onSuccess: () => setToAccept(null) }
          );
        }}
      />

      <ConfirmModal
        open={!!toExclude}
        title="Exclude integration transaction"
        message="This line will be marked excluded and will not post a journal. Continue?"
        confirmText="Exclude"
        danger
        isLoading={excludeMutation.isPending}
        onClose={() => setToExclude(null)}
        onConfirm={() =>
          toExclude &&
          excludeMutation.mutate(toExclude.id, { onSuccess: () => setToExclude(null) })
        }
      />
    </div>
  );
};

export default IntegrationTransactionsTable;
