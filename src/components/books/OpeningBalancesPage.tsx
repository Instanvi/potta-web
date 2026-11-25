'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { useDataTableHandle } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Button } from '@/components/shadcn/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DatePicker } from '@/components/ui/date-picker';
import SearchableSelect from '@/components/searchableSelect';
import { FIELD_INPUT, FIELD_LABEL, FIELD_NO_SPIN, FIELD_SELECT } from '@/lib/field-styles';
import { StatementFilePicker } from '@/components/statement-file-picker';
import { booksApi, extractBooksMeta, extractBooksRows, rowId } from '@/lib/books-api';
import { loadBooksEntityOptions, type BooksEntityOption } from '@/lib/books-entities';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { cn } from '@/lib/utils';

type BalanceLine = { accountId: string; debit?: number; credit?: number; memo?: string };

const COLUMNS = [
  { key: 'asOfDate', label: 'As of' },
  { key: 'accountSummary', label: 'Accounts' },
  { key: 'amountSummary', label: 'Amounts' },
  { key: 'status', label: 'Status' },
];

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
    .filter((row) => row.some(Boolean));
}

function accountIdForCode(code: string, accounts: BooksEntityOption[]): string {
  const needle = code.trim().toLowerCase();
  if (!needle) return '';
  const hit = accounts.find((account) => {
    const label = account.label.toLowerCase();
    return label === needle || label.startsWith(`${needle} `) || account.value === code;
  });
  return hit?.value ?? '';
}

function headerIndex(header: string[], ...needles: string[]) {
  return header.findIndex((cell) => {
    const key = cell.replace(/[\s_-]+/g, '');
    return needles.some((needle) => {
      const want = needle.replace(/[\s_-]+/g, '');
      return cell === needle || key === want;
    });
  });
}

function amountSides(raw: string): { debit: number; credit: number } {
  const amount = Number(raw || 0);
  if (amount > 0) return { debit: amount, credit: 0 };
  if (amount < 0) return { debit: 0, credit: Math.abs(amount) };
  return { debit: 0, credit: 0 };
}

/** CSV columns: account or code, amount (negative = credit) or debit and credit, optional memo. */
export function statementToLines(
  text: string,
  fallbackAccountId: string,
  accounts: BooksEntityOption[],
): BalanceLine[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map((cell) => cell.toLowerCase());
  const accountCol = headerIndex(header, 'account', 'code', 'account code');
  const amountCol = headerIndex(header, 'amount');
  const debitCol = headerIndex(header, 'debit');
  const creditCol = headerIndex(header, 'credit');
  const memoCol = headerIndex(header, 'memo', 'description');
  const named = [accountCol, amountCol, debitCol, creditCol, memoCol].some((index) => index >= 0);
  const data = named ? rows.slice(1) : rows;

  const lines: BalanceLine[] = [];
  for (const row of data) {
    let accountId = '';
    let debit = 0;
    let credit = 0;
    let memo: string | undefined;

    if (named) {
      const code = accountCol >= 0 ? row[accountCol] ?? '' : '';
      accountId = code ? accountIdForCode(code, accounts) : fallbackAccountId;
      if (debitCol >= 0) debit = Number(row[debitCol] || 0);
      if (creditCol >= 0) credit = Number(row[creditCol] || 0);
      if (!(debit > 0 || credit > 0) && amountCol >= 0) {
        ({ debit, credit } = amountSides(row[amountCol] ?? ''));
      }
      memo = memoCol >= 0 ? row[memoCol] : undefined;
    } else if (row.length <= 1) {
      accountId = fallbackAccountId;
      ({ debit, credit } = amountSides(row[0] ?? ''));
    } else {
      const resolved = accountIdForCode(row[0] ?? '', accounts);
      if (resolved) {
        accountId = resolved;
        ({ debit, credit } = amountSides(row[1] ?? ''));
        memo = row[2];
      } else if (fallbackAccountId) {
        accountId = fallbackAccountId;
        ({ debit, credit } = amountSides(row[0] ?? ''));
        memo = row[1];
      }
    }

    if (!accountId || !(debit > 0 || credit > 0)) continue;
    lines.push({
      accountId,
      ...(debit > 0 ? { debit } : { credit }),
      memo: memo || undefined,
    });
  }
  return lines;
}

function summarize(row: Record<string, unknown>, accounts: BooksEntityOption[]) {
  const lines = Array.isArray(row.lines) ? (row.lines as BalanceLine[]) : [];
  const names = lines.map((line) => {
    const match = accounts.find((account) => account.value === line.accountId);
    return match?.label || line.accountId;
  });
  const debit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const credit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
  return {
    ...row,
    accountSummary: names.length ? names.join(', ') : '—',
    amountSummary: lines.length ? `Dr ${money(debit)} · Cr ${money(credit)}` : '—',
  };
}

export function OpeningBalancesPage() {
  const [accounts, setAccounts] = useState<BooksEntityOption[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<ReturnType<typeof extractBooksMeta>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [searchApplied],
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [status, setStatus] = useState('draft');
  const [asOfDate, setAsOfDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'debit' | 'credit'>('debit');
  const [lines, setLines] = useState<BalanceLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadBooksEntityOptions('account').then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: Record<string, unknown> = {};
      if (searchApplied.trim()) filter.search = searchApplied.trim();
      const data = await booksApi.list('opening-balance', filter, {
        page,
        limit,
        sortBy: 'asOfDate:DESC',
      });
      setRows(extractBooksRows(data));
      setMeta(extractBooksMeta(data));
    } catch (err) {
      setError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [limit, page, searchApplied]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRows = useMemo(
    () => rows.map((row) => summarize(row, accounts)),
    [accounts, rows],
  );

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const credit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    return { debit, credit, balanced: Math.round(debit * 100) === Math.round(credit * 100) && lines.length > 0 };
  }, [lines]);

  const resetForm = () => {
    setEditingId('');
    setStatus('draft');
    setAsOfDate('');
    setAccountId('');
    setAmount('');
    setSide('debit');
    setLines([]);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openRow = async (row: Record<string, unknown>) => {
    const id = rowId(row);
    resetForm();
    setEditingId(id);
    setOpen(true);
    try {
      const detail = await booksApi.get('opening-balance', id);
      const record = (detail && typeof detail === 'object'
        ? ((detail as { data?: Record<string, unknown> }).data ?? detail)
        : row) as Record<string, unknown>;
      const date = record.asOfDate ? String(record.asOfDate).slice(0, 10) : '';
      setAsOfDate(date);
      setStatus(String(record.status ?? 'draft'));
      setLines(Array.isArray(record.lines) ? (record.lines as BalanceLine[]) : []);
    } catch {
      toast.error('Could not open this opening balance');
    }
  };

  const addLine = () => {
    const value = Number(amount);
    if (!accountId || !(value > 0)) {
      toast.error('Choose an account and enter an amount');
      return;
    }
    setLines((prev) => [
      ...prev,
      side === 'debit' ? { accountId, debit: value } : { accountId, credit: value },
    ]);
    setAmount('');
  };

  const onStatement = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const next = statementToLines(text, accountId, accounts);
    if (!next.length) {
      toast.error('No amounts found. Use columns account, amount, and optional memo.');
      return;
    }
    setLines((prev) => [...prev, ...next]);
    toast.success(`Added ${next.length} line${next.length === 1 ? '' : 's'} from the statement`);
  };

  const persist = async () => {
    if (!asOfDate || !lines.length) {
      throw new Error('Set the as-of date and at least one amount');
    }
    const body = { asOfDate, lines };
    if (editingId) {
      await booksApi.update('opening-balance', editingId, body);
      return editingId;
    }
    const created = await booksApi.create('opening-balance', body);
    const record = (created && typeof created === 'object'
      ? ((created as { data?: Record<string, unknown> }).data ?? created)
      : {}) as Record<string, unknown>;
    return rowId(record);
  };

  const save = async () => {
    setSaving(true);
    try {
      await persist();
      toast.success(editingId ? 'Opening balance updated' : 'Opening balance created');
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Could not save the opening balance');
    } finally {
      setSaving(false);
    }
  };

  const post = async () => {
    if (!totals.balanced) {
      toast.error('Debits must equal credits before posting');
      return;
    }
    setSaving(true);
    try {
      const id = await persist();
      if (!id) throw new Error('Opening balance was saved without an id');
      await booksApi.action('opening-balance', id, 'post');
      toast.success('Opening balance posted');
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Could not post the opening balance');
    } finally {
      setSaving(false);
    }
  };

  const accountName = (id: string) => accounts.find((account) => account.value === id)?.label || id;

  return (
    <RootLayout>
      <PageContainer>
        <ListToolbar
          actions={
            <>
              {table ? <DataTableViewOptions table={table} /> : null}
              <Button type="button" size="sm" onClick={openCreate}>
                New Opening balance
              </Button>
            </>
          }
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSearchApplied(search);
            }}
            placeholder="Search opening balances…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : (
            <BooksListTable
              columns={COLUMNS}
              rows={displayRows}
              isLoading={loading}
              emptyMessage="No opening balance yet"
              onRowClick={(row) => void openRow(row)}
              storageKey="books-opening-balance-table"
              serverPagination={tableProps(meta, rows.length)}
              showViewOptions={false}
              onTableChange={onTableChange}
            />
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Opening balance' : 'New opening balance'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <DatePicker value={asOfDate} onChange={setAsOfDate} placeholder="As of" outlined />
              <SearchableSelect
                label="Account"
                options={accounts}
                selectedValue={accountId}
                onChange={setAccountId}
                placeholder="Account"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <label className="block space-y-1">
                  <span className={FIELD_LABEL}>Amount</span>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={cn(FIELD_INPUT, FIELD_NO_SPIN)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className={FIELD_LABEL}>Side</span>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as 'debit' | 'credit')}
                    className={FIELD_SELECT}
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </label>
              </div>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={addLine}>
                Add line
              </Button>
              <StatementFilePicker
                label="Import a statement"
                hint="CSV columns: account, amount, memo. Rows without an account use the account selected above."
                onFile={onStatement}
              />
              <ul className="space-y-2 text-sm">
                {lines.map((line, index) => (
                  <li key={`${line.accountId}-${index}`} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{accountName(line.accountId)}</span>
                    <span className="shrink-0 tabular-nums">
                      {line.debit ? `Dr ${money(Number(line.debit))}` : `Cr ${money(Number(line.credit || 0))}`}
                    </span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <p className={cn('text-sm', totals.balanced ? 'text-foreground' : 'text-destructive')}>
                Dr {money(totals.debit)} · Cr {money(totals.credit)}
                {lines.length ? (totals.balanced ? ' · Balanced' : ' · Out of balance') : ''}
              </p>
            </div>
            <SheetFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {status.toLowerCase() !== 'posted' ? (
                <Button type="button" variant="outline" onClick={() => void post()} disabled={saving}>
                  Post
                </Button>
              ) : null}
              <Button type="button" onClick={() => void save()} disabled={saving || status.toLowerCase() === 'posted'}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}
