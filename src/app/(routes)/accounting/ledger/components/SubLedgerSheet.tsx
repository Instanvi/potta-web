'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import { Can } from '@/components/auth/can';
import { formatAmount, formatDate } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Current balance</p>
          <p className="text-lg font-medium">
            {formatAmount(balance.data?.currentBalance ?? row.currentBalance)}
          </p>
        </div>
        <div className="border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Last transaction</p>
          <p className="text-lg font-medium">
            {formatDate(balance.data?.lastTransactionDate)}
          </p>
        </div>
      </div>
      {entries.length === 0 ? (
        <EmptyState title="No transactions" />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 text-left">
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="px-2 py-2 font-medium text-right">Debit</th>
              <th className="px-2 py-2 font-medium text-right">Credit</th>
              <th className="px-2 py-2 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.uuid} className="border-b border-gray-100">
                <td className="px-2 py-2 whitespace-nowrap">{formatDate(e.transactionDate)}</td>
                <td className="px-2 py-2">{e.description || e.referenceNumber}</td>
                <td className="px-2 py-2 text-right">
                  {Number(e.debitAmount) ? formatAmount(e.debitAmount) : ''}
                </td>
                <td className="px-2 py-2 text-right">
                  {Number(e.creditAmount) ? formatAmount(e.creditAmount) : ''}
                </td>
                <td className="px-2 py-2 text-right">{formatAmount(e.runningBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const SubLedgerSheet = ({ type, row, onClose }: Props) => (
  <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{row?.referenceName ?? 'Sub-ledger'}</SheetTitle>
      </SheetHeader>
      <div className="mt-6">
        {row && (
          <Can
            resource="Ledger"
            action="view-sub-ledger-transactions"
            fallback={
              <p className="text-sm text-gray-500">
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
