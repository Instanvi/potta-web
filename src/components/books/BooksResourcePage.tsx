'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  SHEET_FIELD_INPUT,
  SHEET_FIELD_LABEL,
  SHEET_FIELD_TEXTAREA,
} from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import {
  booksApi,
  cellValue,
  extractBooksRows,
  rowId,
} from '@/lib/books-api';
import { cn } from '@/lib/utils';

export type BooksColumn = { key: string; label: string };
export type BooksField = { key: string; label: string; type?: string };
export type BooksAction = { label: string; action: string; confirm?: boolean };

export type BooksResourcePageProps = {
  resourcePath: string;
  title: string;
  columns: BooksColumn[];
  fields: BooksField[];
  actions?: BooksAction[];
  /** Extra query params for list (page, limit, sortBy). */
  listParams?: Record<string, unknown>;
};

function coerceFormValue(type: string | undefined, raw: string): unknown {
  if (type === 'number') {
    if (raw.trim() === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  if (type === 'checkbox' || type === 'boolean') return raw === 'true' || raw === 'on';
  if (type === 'json') {
    if (!raw.trim()) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Invalid JSON');
    }
  }
  return raw === '' ? undefined : raw;
}

function buildPayload(fields: BooksField[], values: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = values[f.key] ?? '';
    const coerced = coerceFormValue(f.type, raw);
    if (coerced !== undefined) out[f.key] = coerced;
  }
  return out;
}

export function BooksResourcePage({
  resourcePath,
  title,
  columns,
  fields,
  actions = [],
  listParams,
}: BooksResourcePageProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const params = useMemo(
    () => ({ page: 1, limit: 50, sortBy: 'createdAt:DESC', ...listParams }),
    [listParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: Record<string, unknown> = {};
      if (search.trim()) filter.search = search.trim();
      const data = await booksApi.list(resourcePath, filter, params);
      setRows(extractBooksRows(data));
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [resourcePath, params, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.type === 'checkbox' ? 'false' : '';
    setForm(initial);
    setCreateOpen(true);
  };

  const openDetail = async (row: Record<string, unknown>) => {
    const id = rowId(row);
    setSelected(row);
    setDetailOpen(true);
    if (!id) return;
    try {
      const detail = await booksApi.get(resourcePath, id);
      const record = (detail?.data ?? detail) as Record<string, unknown>;
      setSelected(record && typeof record === 'object' ? record : row);
      const next: Record<string, string> = {};
      for (const f of fields) {
        const v = record?.[f.key];
        if (f.type === 'json') next[f.key] = v != null ? JSON.stringify(v, null, 2) : '';
        else if (f.type === 'checkbox' || f.type === 'boolean') next[f.key] = v ? 'true' : 'false';
        else next[f.key] = v == null ? '' : String(v);
      }
      setEditForm(next);
    } catch {
      const next: Record<string, string> = {};
      for (const f of fields) {
        const v = row[f.key];
        next[f.key] = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
      setEditForm(next);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = buildPayload(fields, form);
      await booksApi.create(resourcePath, payload);
      toast.success(`${title} created`);
      setCreateOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `Failed to create ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    setSaving(true);
    try {
      const payload = buildPayload(fields, editForm);
      await booksApi.update(resourcePath, id, payload);
      toast.success(`${title} updated`);
      setDetailOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `Failed to update ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) return;
    setSaving(true);
    try {
      await booksApi.remove(resourcePath, id);
      toast.success(`${title} deleted`);
      setDetailOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `Failed to delete ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (act: BooksAction) => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    if (act.confirm && !window.confirm(`${act.label}?`)) return;
    setSaving(true);
    try {
      await booksApi.action(resourcePath, id, act.action);
      toast.success(`${act.label} succeeded`);
      setDetailOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `${act.label} failed`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title={title}
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                Refresh
              </Button>
              <Button type="button" size="sm" onClick={openCreate}>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') void load();
            }}
            placeholder={`Search ${title.toLowerCase()}…`}
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState
              title={`No ${title.toLowerCase()} yet`}
              action={
                <Button type="button" size="sm" onClick={openCreate}>
                  New
                </Button>
              }
            />
          ) : (
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-white">
                    {columns.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium text-muted-foreground">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const id = rowId(row);
                    return (
                      <tr
                        key={id || JSON.stringify(row)}
                        className="cursor-pointer border-b border-black/10 hover:bg-black/[0.02]"
                        onClick={() => void openDetail(row)}
                      >
                        {columns.map((c) => (
                          <td key={c.key} className="px-4 py-3 text-foreground">
                            {cellValue(row, c.key)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          )}
        </div>

        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>New {title}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={form[f.key] ?? ''}
                  onChange={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                />
              ))}
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleCreate()} disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent side="right" className="bg-white">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={editForm[f.key] ?? ''}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, [f.key]: v }))}
                />
              ))}
            </div>
            <SheetFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={saving}>
                Delete
              </Button>
              {actions.map((act) => (
                <Button
                  key={act.action}
                  type="button"
                  variant="outline"
                  onClick={() => void handleAction(act)}
                  disabled={saving}
                >
                  {act.label}
                </Button>
              ))}
              <Button type="button" onClick={() => void handleUpdate()} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </PageContainer>
    </RootLayout>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: BooksField;
  value: string;
  onChange: (v: string) => void;
}) {
  const type = field.type || 'text';
  if (type === 'textarea' || type === 'json') {
    return (
      <label className="block space-y-1">
        <span className={SHEET_FIELD_LABEL}>{field.label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={type === 'json' ? 6 : 3}
          className={SHEET_FIELD_TEXTAREA}
          placeholder={field.label}
        />
      </label>
    );
  }
  if (type === 'checkbox' || type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
          className="size-4 rounded-[2px] border border-black/20"
        />
        <span>{field.label}</span>
      </label>
    );
  }
  if (type === 'date') {
    return (
      <DatePicker
        label={field.label}
        value={value}
        onChange={(v) => onChange(v)}
        outlined
      />
    );
  }
  return (
    <label className="block space-y-1">
      <span className={SHEET_FIELD_LABEL}>{field.label}</span>
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SHEET_FIELD_INPUT}
        placeholder={field.label}
      />
    </label>
  );
}

export default BooksResourcePage;
