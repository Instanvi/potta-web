'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer, PageHeader } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { useDataTableHandle } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FIELD_INPUT, SHEET_FIELD_INPUT, SHEET_FIELD_LABEL } from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import { booksApi, cellValue, extractBooksRows, rowId } from '@/lib/books-api';
import { loadBooksEntityOptions, type BooksEntityOption } from '@/lib/books-entities';
import Select from '@potta/components/select';
import axios from 'config/axios.config';
import { cn } from '@/lib/utils';

type BankAccount = { uuid?: string; id?: string; name?: string; account_name?: string; accountName?: string };

const COLUMNS = [
  { key: 'transactionDate', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'accountLabel', label: 'Account' },
  { key: 'status', label: 'Status' },
  { key: 'reference', label: 'Reference' },
];

const FIELDS = [
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
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [matchAr, setMatchAr] = useState('');
  const [matchAp, setMatchAp] = useState('');
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [chartAccounts, setChartAccounts] = useState<BooksEntityOption[]>([]);

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

  useEffect(() => {
    void loadBooksEntityOptions('account').then(setChartAccounts).catch(() => setChartAccounts([]));
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await axios.get('/bank-accounts', { params: { page: 1, limit: 100 } });
        const list = extractBooksRows(res.data);
        setAccounts(list.length ? (list as BankAccount[]) : Array.isArray(res.data) ? res.data : []);
      } catch {
        setAccounts([]);
      }
    })();
  }, []);

  const applyRules = async () => {
    setSaving(true);
    try {
      const res = await axios.post('/bank-transactions/apply-rules');
      const applied = Number(res.data?.applied ?? res.data?.data?.applied ?? 0);
      toast.success(applied ? `Applied rules to ${applied} transaction${applied === 1 ? '' : 's'}` : 'No matching transactions');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not apply bank rules');
    } finally {
      setSaving(false);
    }
  };

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
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => void load()}
                aria-label="Refresh"
                title="Refresh"
              >
                <i className="ri-refresh-line text-base" />
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
        <ListToolbar
          actions={
            <>
              {table ? <DataTableViewOptions table={table} /> : null}
              <Button type="button" variant="outline" size="sm" onClick={() => void applyRules()} disabled={saving}>
                Apply rules
              </Button>
            </>
          }
        >
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
          ) : (
            <BooksListTable
              columns={COLUMNS}
              rows={rows.map((row): Record<string, unknown> => {
                const accountId = String(row.accountId ?? '');
                const account = chartAccounts.find((item) => item.value === accountId);
                return { ...row, accountLabel: account?.label || (accountId ? accountId : '—') };
              })}
              storageKey="books-bank-transactions-table"
              isLoading={loading}
              emptyMessage="No bank transactions"
              onTableChange={onTableChange}
              onRowClick={(row) => {
                setDetail(row);
                setMatchAr('');
                setMatchAp('');
              }}
            />
          )}
        </div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>New bank transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <Select
                name="Bank account"
                selectedValue={form.bankAccountId ?? ''}
                onChange={(value) => setForm((p) => ({ ...p, bankAccountId: value }))}
                options={accounts.map((account) => {
                  const id = String(account.uuid ?? account.id ?? '');
                  const label = account.name ?? account.account_name ?? account.accountName ?? id;
                  return { value: id, label };
                })}
              />
              {FIELDS.map((f) =>
                f.type === 'date' ? (
                  <DatePicker
                    key={f.key}
                    label={f.label}
                    value={form[f.key] ?? ''}
                    onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
                    outlined
                  />
                ) : (
                  <label key={f.key} className="block space-y-1">
                    <span className={SHEET_FIELD_LABEL}>{f.label}</span>
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className={SHEET_FIELD_INPUT}
                    />
                  </label>
                )
              )}
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
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>Match transaction</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto text-sm">
              {COLUMNS.map((c) => (
                <div key={c.key} className="flex justify-between gap-4 border-b border-black/10 py-2">
                  <span className="text-foreground">{c.label}</span>
                  <span>{detail ? cellValue(detail, c.key) : '—'}</span>
                </div>
              ))}
              <label className="block space-y-1 pt-2">
                <span className={SHEET_FIELD_LABEL}>AR payment ID</span>
                <input value={matchAr} onChange={(e) => setMatchAr(e.target.value)} className={SHEET_FIELD_INPUT} />
              </label>
              <label className="block space-y-1">
                <span className={SHEET_FIELD_LABEL}>AP payment ID</span>
                <input value={matchAp} onChange={(e) => setMatchAp(e.target.value)} className={SHEET_FIELD_INPUT} />
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
