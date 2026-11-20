'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ListToolbar, PageContainer, Panel, StatCard } from '@/app/(routes)/_shared/states';
import { Button } from '@/components/shadcn/button';
import { FIELD_INPUT } from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import { booksApi, cellValue, extractBooksRows, rowId } from '@/lib/books-api';
import axios from 'config/axios.config';
import { cn } from '@/lib/utils';

type BankAccount = { uuid?: string; id?: string; name?: string; account_name?: string; accountName?: string };

export function ReconcilePage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bankAccountId, setBankAccountId] = useState('');
  const [statementDate, setStatementDate] = useState('');
  const [endingBalance, setEndingBalance] = useState('');
  const [reconcileId, setReconcileId] = useState<string | null>(null);
  const [reconcile, setReconcile] = useState<Record<string, unknown> | null>(null);
  const [lines, setLines] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await axios.get('/bank-accounts', { params: { page: 1, limit: 100 } });
        const rows = extractBooksRows(res.data);
        setAccounts(rows.length ? (rows as BankAccount[]) : Array.isArray(res.data) ? res.data : []);
      } catch {
        setAccounts([]);
      }
    })();
  }, []);

  const loadLines = useCallback(async (accountId: string) => {
    try {
      const data = await booksApi.list(
        'bank-transactions',
        { bankAccountId: accountId },
        { page: 1, limit: 100, sortBy: 'transactionDate:DESC' }
      );
      setLines(extractBooksRows(data));
    } catch {
      setLines([]);
    }
  }, []);

  const start = async () => {
    if (!bankAccountId || !statementDate || endingBalance === '') {
      toast.error('Select account, statement date, and ending balance');
      return;
    }
    setBusy(true);
    try {
      const rec = await axios
        .post('/bank-transactions/reconcile/start', {
          bankAccountId,
          statementDate,
          statementEndingBalance: Number(endingBalance),
        })
        .then((r) => r.data);
      const id = String(rec?.uuid ?? rec?.id ?? rec?.data?.uuid ?? '');
      setReconcileId(id || null);
      setReconcile((rec?.data ?? rec) as Record<string, unknown>);
      setSelected(new Set());
      await loadLines(bankAccountId);
      toast.success('Reconciliation started');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not start reconciliation');
    } finally {
      setBusy(false);
    }
  };

  const clearSelected = async () => {
    if (!reconcileId || selected.size === 0) return;
    setBusy(true);
    try {
      const rec = await axios
        .post(`/bank-transactions/reconcile/${reconcileId}/clear`, {
          transactionIds: Array.from(selected),
        })
        .then((r) => r.data);
      setReconcile((rec?.data ?? rec) as Record<string, unknown>);
      toast.success('Lines cleared');
      await loadLines(bankAccountId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Clear failed');
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!reconcileId) return;
    setBusy(true);
    try {
      await axios.post(`/bank-transactions/reconcile/${reconcileId}/finish`);
      toast.success('Reconciliation finished');
      setReconcileId(null);
      setReconcile(null);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Finish failed (difference must be 0)');
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <RootLayout>
      <PageContainer>
        <ListToolbar
          actions={
            <>
              {!reconcileId ? (
                <Button type="button" size="sm" onClick={() => void start()} disabled={busy}>
                  Start reconcile
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => void clearSelected()} disabled={busy}>
                    Clear selected
                  </Button>
                  <Button type="button" size="sm" onClick={() => void finish()} disabled={busy}>
                    Finish
                  </Button>
                </>
              )}
            </>
          }
        >
          <select
            value={bankAccountId}
            onChange={(e) => setBankAccountId(e.target.value)}
            className={cn(FIELD_INPUT, 'max-w-xs')}
            disabled={!!reconcileId}
          >
            <option value="">Select bank account</option>
            {accounts.map((a) => {
              const id = String(a.uuid ?? a.id ?? '');
              const label = a.name ?? a.account_name ?? a.accountName ?? id;
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
          <DatePicker
            value={statementDate}
            onChange={setStatementDate}
            placeholder="Statement date"
            disabled={!!reconcileId}
            className="max-w-[200px]"
          />
          <input
            type="number"
            value={endingBalance}
            onChange={(e) => setEndingBalance(e.target.value)}
            placeholder="Statement ending balance"
            className={cn(FIELD_INPUT, 'max-w-[200px]')}
            disabled={!!reconcileId}
          />
        </ListToolbar>

        {reconcile && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Cleared total" value={String(reconcile.clearedTotal ?? 0)} />
            <StatCard label="Ending balance" value={String(reconcile.statementEndingBalance ?? endingBalance)} />
            <StatCard
              label="Difference"
              value={String(reconcile.difference ?? '—')}
              tone={Number(reconcile.difference) === 0 ? 'success' : 'destructive'}
            />
          </div>
        )}

        <div className="mt-4">
          {!reconcileId ? (
            <EmptyState
              title="Start a reconciliation"
              description="Choose a bank account and statement ending balance, then clear matching lines."
            />
          ) : lines.length === 0 ? (
            <EmptyState title="No bank lines" description="No transactions for this account." />
          ) : (
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row) => {
                    const id = rowId(row);
                    return (
                      <tr key={id} className="border-b border-black/10">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(id)}
                            onChange={() => toggle(id)}
                            className="size-4 rounded-[2px]"
                          />
                        </td>
                        <td className="px-4 py-3">{cellValue(row, 'transactionDate')}</td>
                        <td className="px-4 py-3">{cellValue(row, 'description')}</td>
                        <td className="px-4 py-3">{cellValue(row, 'amount')}</td>
                        <td className="px-4 py-3">{cellValue(row, 'status')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
}
