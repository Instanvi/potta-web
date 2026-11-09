'use client';
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import { Can } from '@/components/auth/can';
import { formatAmount, formatDate } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState, StatCard } from '../../../_shared/states';
import {
  useSubLedgerBalance,
  useSubLedgerIdForReference,
  useSubLedgerTransactions,
} from '../hooks';
import { AgingRow, SubLedgerKind } from '../utils/api';
import { SubLedgerEntry } from '../utils/types';

const right = (value: React.ReactNode) => <div className="w-full text-right tabular-nums">{value}</div>;

const columns: ColumnDef<SubLedgerEntry>[] = [
  {
    accessorKey: 'transactionDate',
    header: 'Date',
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.transactionDate)}</span>,
  },
  {
    id: 'description',
    header: 'Description',
    accessorFn: (e) => e.description || e.referenceNumber,
  },
  {
    id: 'debit',
    header: () => right('Debit'),
    accessorFn: (e) => Number(e.debitAmount ?? 0),
    cell: ({ row }) => right(Number(row.original.debitAmount) ? formatAmount(row.original.debitAmount) : ''),
  },
  {
    id: 'credit',
    header: () => right('Credit'),
    accessorFn: (e) => Number(e.creditAmount ?? 0),
    cell: ({ row }) => right(Number(row.original.creditAmount) ? formatAmount(row.original.creditAmount) : ''),
  },
  {
    id: 'balance',
    header: () => right('Balance'),
    accessorFn: (e) => Number(e.runningBalance ?? 0),
    cell: ({ row }) => right(formatAmount(row.original.runningBalance)),
  },
];

interface Props {
  type: SubLedgerKind;
  row: AgingRow | null;
  onClose: () => void;
}

const Transactions = ({ type, row }: { type: SubLedgerKind; row: AgingRow }) => {
  const ref = useSubLedgerIdForReference(type, row.referenceId);
  const subLedgerId = ref.data;
  const tx = useSubLedgerTransactions(subLedgerId);
  const balance = useSubLedgerBalance(subLedgerId);

  if (ref.isLoading || tx.isLoading) return <LoadingState />;
  if (ref.error) return <ErrorState error={ref.error} onRetry={() => ref.refetch()} />;
  if (!subLedgerId)
    return (
      <EmptyState
        title="No sub-ledger linked"
        description={`This ${type === 'AR' ? 'customer' : 'vendor'} has no sub-ledger yet.`}
      />
    );
  if (tx.error) return <ErrorState error={tx.error} onRetry={() => tx.refetch()} />;

  const entries = tx.data ?? [];
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <StatCard
          label="Current balance"
          value={formatAmount(balance.data?.currentBalance ?? row.currentBalance)}
        />
        <StatCard label="Last transaction" value={formatDate(balance.data?.lastTransactionDate)} />
      </div>
      {entries.length === 0 ? (
        <EmptyState title="No transactions" />
      ) : (
        <DataTable columns={columns} data={entries} withRowSelection={false} pageSize={10} />
      )}
    </div>
  );
};

const SubLedgerSheet = ({ type, row, onClose }: Props) => (
  <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
    <SheetContent side="right" className="w-full overflow-y-auto rounded-none sm:max-w-[min(100vw,720px)]">
      <SheetHeader>
        <SheetTitle>{row?.referenceName ?? 'Sub-ledger'}</SheetTitle>
      </SheetHeader>
      <div className="mt-6">
        {row && (
          <Can
            resource="Ledger"
            action="view-sub-ledger-transactions"
            fallback={
              <p className="text-sm text-muted-foreground">
                You do not have permission to view sub-ledger transactions.
              </p>
            }
          >
            <Transactions type={type} row={row} />
          </Can>
        )}
      </div>
    </SheetContent>
  </Sheet>
);

export default SubLedgerSheet;
