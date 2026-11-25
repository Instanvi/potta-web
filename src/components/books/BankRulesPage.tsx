'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { useDataTableHandle } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Button } from '@/components/shadcn/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Select from '@potta/components/select';
import SearchableSelect from '@/components/searchableSelect';
import { FIELD_INPUT, FIELD_NO_SPIN } from '@/lib/field-styles';
import { booksApi, extractBooksRows, rowId } from '@/lib/books-api';
import { loadBooksEntityOptions, type BooksEntityOption } from '@/lib/books-entities';
import { cn } from '@/lib/utils';

type Condition = { field: string; operator: string; value: string };

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'isActive', label: 'Active' },
  { key: 'priority', label: 'Priority' },
  { key: 'conditionSummary', label: 'When' },
  { key: 'actionSummary', label: 'Assign' },
];

const FIELDS = [
  { value: 'description', label: 'Description' },
  { value: 'amount', label: 'Amount' },
  { value: 'reference', label: 'Reference' },
];

const OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
];

function asRecord(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const obj = payload as { data?: Record<string, unknown> };
  return obj.data && typeof obj.data === 'object' ? obj.data : (payload as Record<string, unknown>);
}

function summarize(row: Record<string, unknown>, accounts: BooksEntityOption[]) {
  const conditions = Array.isArray(row.conditions) ? (row.conditions as Condition[]) : [];
  const actions = Array.isArray(row.actions) ? (row.actions as Array<{ accountId?: string }>) : [];
  const accountId = actions.find((action) => action.accountId)?.accountId;
  const account = accounts.find((item) => item.value === accountId);
  return {
    ...row,
    conditionSummary: conditions.length
      ? conditions.map((condition) => `${condition.field} ${condition.operator} ${condition.value}`).join('; ')
      : '—',
    actionSummary: account?.label || '—',
  };
}

export function BankRulesPage() {
  const [accounts, setAccounts] = useState<BooksEntityOption[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState('0');
  const [field, setField] = useState('description');
  const [operator, setOperator] = useState('contains');
  const [value, setValue] = useState('');
  const [accountId, setAccountId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadBooksEntityOptions('account').then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: Record<string, unknown> = {};
      if (search.trim()) filter.search = search.trim();
      const data = await booksApi.list('bank-rule', filter, { page: 1, limit: 50, sortBy: 'priority:ASC' });
      setRows(extractBooksRows(data));
    } catch (err) {
      setError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = () => {
    setEditingId('');
    setName('');
    setActive(true);
    setPriority('0');
    setField('description');
    setOperator('contains');
    setValue('');
    setAccountId('');
  };

  const openRow = async (row: Record<string, unknown>) => {
    const id = rowId(row);
    reset();
    setEditingId(id);
    setOpen(true);
    try {
      const record = asRecord(await booksApi.get('bank-rule', id));
      const conditions = Array.isArray(record.conditions) ? (record.conditions as Condition[]) : [];
      const actions = Array.isArray(record.actions) ? (record.actions as Array<{ accountId?: string }>) : [];
      const first = conditions[0];
      setName(String(record.name ?? ''));
      setActive(record.isActive !== false);
      setPriority(String(record.priority ?? 0));
      if (first) {
        setField(first.field || 'description');
        setOperator(first.operator || 'contains');
        setValue(first.value || '');
      }
      setAccountId(String(actions.find((action) => action.accountId)?.accountId ?? ''));
    } catch {
      toast.error('Could not open this rule');
    }
  };

  const save = async () => {
    if (!name.trim() || !value.trim() || !accountId) {
      toast.error('Name the rule, set a condition, and choose an account');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        isActive: active,
        priority: Number(priority) || 0,
        conditions: [{ field, operator, value: value.trim() }],
        actions: [{ type: 'assign_account', accountId }],
      };
      if (editingId) await booksApi.update('bank-rule', editingId, body);
      else await booksApi.create('bank-rule', body);
      toast.success(editingId ? 'Bank rule updated' : 'Bank rule created');
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save the bank rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RootLayout>
      <PageContainer>
        <ListToolbar
          actions={
            <>
              {table ? <DataTableViewOptions table={table} /> : null}
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  reset();
                  setOpen(true);
                }}
              >
                New Bank rule
              </Button>
            </>
          }
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search bank rules…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>
        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : (
            <BooksListTable
              columns={COLUMNS}
              rows={rows.map((row) => summarize(row, accounts))}
              isLoading={loading}
              emptyMessage="No bank rule yet"
              storageKey="books-bank-rule-table"
              showViewOptions={false}
              onTableChange={onTableChange}
              onRowClick={(row) => void openRow(row)}
            />
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Bank rule' : 'New bank rule'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={FIELD_INPUT}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="Priority"
                className={cn(FIELD_INPUT, FIELD_NO_SPIN)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Select options={FIELDS} selectedValue={field} onChange={setField} placeholder="Field" />
                <Select options={OPERATORS} selectedValue={operator} onChange={setOperator} placeholder="Operator" />
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Value"
                  className={FIELD_INPUT}
                />
              </div>
              <SearchableSelect
                options={accounts}
                selectedValue={accountId}
                onChange={setAccountId}
                placeholder="Assign account"
              />
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}
