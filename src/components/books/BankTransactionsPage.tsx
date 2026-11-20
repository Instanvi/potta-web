'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ErrorState, ListToolbar, PageContainer, PageHeader, Panel } from '@/app/(routes)/_shared/states';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FIELD_INPUT } from '@/lib/field-styles';
import { booksApi, cellValue, extractBooksRows, rowId } from '@/lib/books-api';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { key: 'transactionDate', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'reference', label: 'Reference' },
];

const FIELDS = [
  { key: 'bankAccountId', label: 'Bank account ID' },
  { key: 'transactionDate', label: 'Date', type: 'date' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'description', label: 'Description' },
  { key: 'reference', label: 'Reference' },
];

export function BankTransactionsPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [matchAr, setMatchAr] = useState('');
  const [matchAp, setMatchAp] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: Record<string, unknown> = {};
      if (search.trim()) filter.search = search.trim();
      const data = await booksApi.list('bank-transactions', filter, {
        page: 1,
        limit: 50,
        sortBy: 'transactionDate:DESC',
      });
      setRows(extractBooksRows(data));
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await booksApi.create('bank-transactions', {
        bankAccountId: form.bankAccountId,
        transactionDate: form.transactionDate,
        amount: Number(form.amount),
        description: form.description || undefined,
        reference: form.reference || undefined,
      });
      toast.success('Bank transaction created');
      setCreateOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const runMatch = async () => {
    const id = detail ? rowId(detail) : '';
    if (!id) return;
    setSaving(true);
    try {
      await booksApi.action('bank-transactions', id, 'match', {
        arPaymentId: matchAr || undefined,
        apPaymentId: matchAp || undefined,
      });
      toast.success('Matched');
      setDetail(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Match failed');
    } finally {
      setSaving(false);
    }
  };

  const runSimple = async (action: string, label: string) => {
    const id = detail ? rowId(detail) : '';
    if (!id) return;
    setSaving(true);
    try {
      await booksApi.action('bank-transactions', id, action);
      toast.success(label);
      setDetail(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `${label} failed`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Bank transactions"
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Refresh
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setForm({});
                  setCreateOpen(true);
                }}
              >
                New
              </Button>
            </>
          }
        />
        <ListToolbar>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search bank transactions…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState title="No bank transactions" />
          ) : (
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium text-muted-foreground">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={rowId(row)}
                      className="cursor-pointer border-b border-black/10 hover:bg-black/[0.02]"
                      onClick={() => {
                        setDetail(row);
                        setMatchAr('');
                        setMatchAp('');
                      }}
                    >
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          {cellValue(row, c.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="left" className="bg-white">
            <SheetHeader>
              <SheetTitle>New bank transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {FIELDS.map((f) => (
                <label key={f.key} className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className={FIELD_INPUT}
                  />
                </label>
              ))}
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
                Create
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <SheetContent side="left" className="bg-white">
            <SheetHeader>
              <SheetTitle>Match transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-3 text-sm">
              {COLUMNS.map((c) => (
                <div key={c.key} className="flex justify-between gap-4 border-b border-black/10 py-2">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span>{detail ? cellValue(detail, c.key) : '—'}</span>
                </div>
              ))}
              <label className="block space-y-1 pt-2">
                <span className="text-xs font-medium text-muted-foreground">AR payment ID</span>
                <input value={matchAr} onChange={(e) => setMatchAr(e.target.value)} className={FIELD_INPUT} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">AP payment ID</span>
                <input value={matchAp} onChange={(e) => setMatchAp(e.target.value)} className={FIELD_INPUT} />
              </label>
            </div>
            <SheetFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
              <Button type="button" variant="outline" onClick={() => void runSimple('exclude', 'Excluded')} disabled={saving}>
                Exclude
              </Button>
              <Button type="button" variant="outline" onClick={() => void runSimple('accept', 'Accepted')} disabled={saving}>
                Accept
              </Button>
              <Button type="button" onClick={() => void runMatch()} disabled={saving}>
                Match
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}
