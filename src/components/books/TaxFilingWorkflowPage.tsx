'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ErrorState, PageContainer, PageHeader, Panel } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SHEET_FIELD_INPUT, SHEET_FIELD_LABEL } from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import { booksApi, cellValue, extractBooksRows, rowId } from '@/lib/books-api';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'periodStart', label: 'Period start' },
  { key: 'periodEnd', label: 'Period end' },
  { key: 'status', label: 'Status' },
];

export function TaxFilingWorkflowPage({ mode }: { mode: 'prepare' | 'submit' }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', periodStart: '', periodEnd: '' });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.list('tax-filing', {}, { page: 1, limit: 50, sortBy: 'createdAt:DESC' });
      setRows(extractBooksRows(data));
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await booksApi.create('tax-filing', form);
      toast.success('Tax filing created');
      setCreateOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async () => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    setSaving(true);
    try {
      await booksApi.action('tax-filing', id, mode);
      toast.success(mode === 'prepare' ? 'Filing prepared' : 'Filing submitted');
      setSelected(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `${mode} failed`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={mode === 'prepare' ? 'Prepare tax filing' : 'Submit tax filing'}
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
                  setForm({ name: '', periodStart: '', periodEnd: '' });
                  setCreateOpen(true);
                }}
              >
                New filing
              </Button>
            </>
          }
        />

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState title="No tax filings" description="Create a filing to get started." />
          ) : (
            <BooksListTable
              columns={COLUMNS}
              rows={rows}
              onRowClick={(row) => setSelected(row)}
            />
          )}
        </div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>New tax filing</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              <label className="block space-y-1">
                <span className={SHEET_FIELD_LABEL}>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={SHEET_FIELD_INPUT}
                />
              </label>
              <DatePicker
                label="Period start"
                value={form.periodStart}
                onChange={(v) => setForm((p) => ({ ...p, periodStart: v }))}
                outlined
              />
              <DatePicker
                label="Period end"
                value={form.periodEnd}
                onChange={(v) => setForm((p) => ({ ...p, periodEnd: v }))}
                outlined
              />
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

        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>{mode === 'prepare' ? 'Prepare filing' : 'Submit filing'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2 text-sm">
              {COLUMNS.map((c) => (
                <div key={c.key} className="flex justify-between gap-4 border-b border-black/10 py-2">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span>{selected ? cellValue(selected, c.key) : '—'}</span>
                </div>
              ))}
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button type="button" onClick={() => void runAction()} disabled={saving}>
                {mode === 'prepare' ? 'Prepare' : 'Submit'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}
