'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer, StatusBadge } from '@/app/(routes)/_shared/states';
import { formatMoney } from '@/app/(routes)/account_payables/utils/format';
import { DataTable, useDataTableHandle } from '@/components/ui/data-table';
import { ListActionsMenu, ListActionItem } from '@/components/list-actions-menu';
import { ExportButton } from '@/components/export-button';
import { Button } from '@/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DatePicker } from '@/components/ui/date-picker';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { FIELD_INPUT, FIELD_LABEL, FIELD_NO_SPIN, FIELD_SELECT, FIELD_TEXTAREA } from '@/lib/field-styles';
import { extractBooksRows, rowId } from '@/lib/books-api';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import axios from 'config/axios.config';
import { cn } from '@/lib/utils';

type ExpenseRow = Record<string, unknown>;

const STATUSES = ['pending', 'posted', 'failed', 'reversed'] as const;
const TYPES = ['debit', 'credit'] as const;

const EMPTY_FORM = {
  transactionDate: '',
  merchant: '',
  description: '',
  amount: '',
  currency: 'XAF',
  category: '',
  type: 'debit',
  status: 'pending',
  reference: '',
  notes: '',
};

function normalizeTx(row: ExpenseRow): ExpenseRow {
  const date = row.date ?? row.transactionDate ?? row.transaction_date ?? row.createdAt ?? row.created_at;
  return {
    ...row,
    date,
    merchant: row.merchant ?? row.merchant_name ?? row.vendor_name ?? row.description,
    category: row.category ?? row.category_name ?? row.expense_category,
    currency: row.currency ?? 'XAF',
  };
}

function labelize(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  return text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusTone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'posted') return 'success';
  if (status === 'failed' || status === 'reversed') return 'danger';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

function toDateInput(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formFromRow(row: ExpenseRow) {
  return {
    transactionDate: toDateInput(row.date ?? row.transactionDate),
    merchant: String(row.merchant ?? ''),
    description: String(row.description ?? row.merchant ?? ''),
    amount: row.amount == null ? '' : String(row.amount),
    currency: String(row.currency ?? 'XAF'),
    category: String(row.category ?? ''),
    type: String(row.type ?? 'debit'),
    status: String(row.status ?? 'pending'),
    reference: String(row.reference ?? ''),
    notes: String(row.notes ?? ''),
  };
}

function payloadFromForm(form: typeof EMPTY_FORM) {
  const merchant = form.merchant.trim();
  const description = form.description.trim() || merchant;
  return {
    transactionDate: form.transactionDate || undefined,
    merchant: merchant || undefined,
    description,
    amount: Number(form.amount),
    currency: form.currency.trim() || 'XAF',
    category: form.category.trim() || undefined,
    type: form.type || 'debit',
    status: form.status || 'pending',
    reference: form.reference.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

export function PayrollExpensesPage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { table, onTableChange } = useDataTableHandle<ExpenseRow>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ExpenseRow | null>(null);

  const fetchPage = useCallback(
    async (page: number, limit: number, withStatus: boolean) => {
      const res = await axios.get('/expense/transactions', {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          sortBy: 'transactionDate:DESC',
          ...(withStatus && status ? { 'filter.status': `$eq:${status}` } : {}),
        },
      });
      const body = res.data?.data && !Array.isArray(res.data.data) ? res.data.data : res.data;
      const list = extractBooksRows(body).map(normalizeTx);
      const filtered = !withStatus && status ? list.filter((row) => String(row.status) === status) : list;
      return {
        rows: filtered,
        meta: (body as { meta?: { totalItems?: number; totalPages?: number; currentPage?: number } })?.meta,
      };
    },
    [search, status],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let page;
      try {
        page = await fetchPage(1, 50, true);
      } catch (err) {
        if (!status) throw err;
        page = await fetchPage(1, 50, false);
      }
      setRows(page.rows);
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, transactionDate: toDateInput(new Date()) });
    setSheetOpen(true);
  };

  const openEdit = useCallback((row: ExpenseRow) => {
    setEditing(row);
    setForm(formFromRow(row));
    setSheetOpen(true);
  }, []);

  const save = async () => {
    const body = payloadFromForm(form);
    if (!body.description) {
      toast.error('Add a merchant or description');
      return;
    }
    if (!Number.isFinite(body.amount)) {
      toast.error('Enter an amount');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/expense/transactions/${rowId(editing)}`, body);
        toast.success('Expense updated');
      } else {
        await axios.post('/expense/transactions/create', body);
        toast.success('Expense created');
      }
      setSheetOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  const setStatusOn = useCallback(async (row: ExpenseRow, next: string, label: string) => {
    const id = rowId(row);
    if (!id) return;
    setSaving(true);
    try {
      await axios.put(`/expense/transactions/${id}`, { status: next });
      toast.success(label);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `${label} failed`);
    } finally {
      setSaving(false);
    }
  }, [load]);

  const remove = async () => {
    const id = pendingDelete ? rowId(pendingDelete) : '';
    if (!id) return;
    setSaving(true);
    try {
      await axios.delete(`/expense/transactions/${id}`);
      toast.success('Expense deleted');
      setPendingDelete(null);
      if (editing && rowId(editing) === id) setSheetOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not delete expense');
    } finally {
      setSaving(false);
    }
  };

  const exportColumns = useMemo(
    () => [
      { key: 'date', header: 'Date', value: (row: ExpenseRow) => toDateInput(row.date) },
      { key: 'merchant', header: 'Merchant', value: (row: ExpenseRow) => String(row.merchant ?? '') },
      { key: 'amount', header: 'Amount', value: (row: ExpenseRow) => String(row.amount ?? '') },
      { key: 'currency', header: 'Currency', value: (row: ExpenseRow) => String(row.currency ?? '') },
      { key: 'status', header: 'Status', value: (row: ExpenseRow) => String(row.status ?? '') },
      { key: 'category', header: 'Category', value: (row: ExpenseRow) => String(row.category ?? '') },
      { key: 'type', header: 'Type', value: (row: ExpenseRow) => String(row.type ?? '') },
      { key: 'reference', header: 'Reference', value: (row: ExpenseRow) => String(row.reference ?? '') },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<ExpenseRow>[]>(
    () => [
      {
        id: 'date',
        header: 'Date',
        accessorFn: (row) => String(row.date ?? ''),
        cell: ({ row }) => toDateInput(row.original.date) || '—',
      },
      {
        id: 'merchant',
        header: 'Merchant',
        accessorFn: (row) => String(row.merchant ?? ''),
      },
      {
        id: 'amount',
        header: 'Amount',
        accessorFn: (row) => Number(row.amount ?? 0),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatMoney(row.original.amount, String(row.original.currency ?? 'XAF'))}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => String(row.status ?? ''),
        cell: ({ row }) => {
          const value = String(row.original.status ?? '');
          return <StatusBadge tone={statusTone(value)}>{labelize(value)}</StatusBadge>;
        },
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => String(row.category ?? ''),
        cell: ({ row }) => labelize(row.original.category),
      },
      {
        id: 'type',
        header: 'Type',
        accessorFn: (row) => String(row.type ?? ''),
        cell: ({ row }) => labelize(row.original.type),
      },
      {
        id: 'reference',
        header: 'Reference',
        accessorFn: (row) => String(row.reference ?? ''),
        cell: ({ row }) => String(row.original.reference ?? '') || '—',
      },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          const current = String(item.status ?? '');
          return (
            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-black/[0.04]"
                    aria-label="Expense actions"
                  >
                    <i className="ri-more-2-fill text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-white">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(item)}>
                    <i className="ri-pencil-line mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {current === 'pending' ? (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => void setStatusOn(item, 'posted', 'Expense posted')}
                    >
                      <i className="ri-check-line mr-2" />
                      Post
                    </DropdownMenuItem>
                  ) : null}
                  {current === 'posted' ? (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => void setStatusOn(item, 'reversed', 'Expense reversed')}
                    >
                      <i className="ri-arrow-go-back-line mr-2" />
                      Reverse
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => setPendingDelete(item)}
                  >
                    <i className="ri-delete-bin-line mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [openEdit, setStatusOn],
  );

  const setField = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <RootLayout>
      <PageContainer className="bg-white">
        <ListToolbar
          actions={
            <>
              <ListActionsMenu table={table}>
                <ExportButton
                  asItem
                  filename="expenses"
                  rows={rows}
                  columns={exportColumns}
                  disabled={loading}
                  fetchAllRows={() =>
                    fetchAllPages(async (page, limit) => {
                      const result = await fetchPage(page, limit, Boolean(status)).catch(() =>
                        fetchPage(page, limit, false),
                      );
                      return { data: result.rows, meta: result.meta };
                    })
                  }
                />
                <ListActionItem
                  label="Refresh"
                  icon={<i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`} />}
                  disabled={loading}
                  onSelect={() => void load()}
                />
              </ListActionsMenu>
              <Button type="button" size="sm" onClick={openCreate}>
                <i className="ri-add-line" />
                New expense
              </Button>
            </>
          }
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search expenses…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Status"
            className={cn(FIELD_SELECT, 'w-40')}
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {labelize(item)}
              </option>
            ))}
          </select>
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              isLoading={loading}
              emptyMessage="No expense transactions"
              storageKey="payroll-expenses-table"
              showViewOptions={false}
              onTableChange={onTableChange}
              onRowClick={openEdit}
            />
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>{editing ? 'Edit expense' : 'New expense'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <DatePicker
                label="Date"
                value={form.transactionDate}
                onChange={(value) => setField('transactionDate', value)}
              />
              <label className="block">
                <span className={FIELD_LABEL}>Merchant</span>
                <input
                  value={form.merchant}
                  onChange={(e) => setField('merchant', e.target.value)}
                  className={FIELD_INPUT}
                />
              </label>
              <label className="block">
                <span className={FIELD_LABEL}>Description</span>
                <input
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className={FIELD_INPUT}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={FIELD_LABEL}>Amount</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    className={cn(FIELD_INPUT, FIELD_NO_SPIN)}
                  />
                </label>
                <label className="block">
                  <span className={FIELD_LABEL}>Currency</span>
                  <input
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                    maxLength={3}
                    className={FIELD_INPUT}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={FIELD_LABEL}>Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setField('type', e.target.value)}
                    className={FIELD_SELECT}
                  >
                    {TYPES.map((item) => (
                      <option key={item} value={item}>
                        {labelize(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={FIELD_LABEL}>Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className={FIELD_SELECT}
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {labelize(item)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className={FIELD_LABEL}>Category</span>
                <input
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className={FIELD_INPUT}
                />
              </label>
              <label className="block">
                <span className={FIELD_LABEL}>Reference</span>
                <input
                  value={form.reference}
                  onChange={(e) => setField('reference', e.target.value)}
                  className={FIELD_INPUT}
                />
              </label>
              <label className="block">
                <span className={FIELD_LABEL}>Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  className={FIELD_TEXTAREA}
                />
              </label>
            </div>
            <SheetFooter className="flex-wrap gap-2">
              {editing ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setPendingDelete(editing)}
                  disabled={saving}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title="Delete expense"
          description="This removes the expense from the list."
          confirmText="Delete"
          isLoading={saving}
          onConfirm={() => void remove()}
        />
      </PageContainer>
    </RootLayout>
  );
}
