'use client';
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
        <div className="overflow-hidden rounded-[2px] border border-black/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="h-11 border-b border-black/10 bg-table-head text-left">
              <th className="px-3 font-normal">Date</th>
              <th className="px-3 font-normal">Description</th>
              <th className="px-3 text-right font-normal">Debit</th>
              <th className="px-3 text-right font-normal">Credit</th>
              <th className="px-3 text-right font-normal">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.uuid} className="border-b border-black/[0.06] last:border-b-0 hover:bg-black/[0.02]">
                <td className="whitespace-nowrap px-3 py-2.5">{formatDate(e.transactionDate)}</td>
                <td className="px-3 py-2.5">{e.description || e.referenceNumber}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {Number(e.debitAmount) ? formatAmount(e.debitAmount) : ''}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {Number(e.creditAmount) ? formatAmount(e.creditAmount) : ''}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatAmount(e.runningBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
