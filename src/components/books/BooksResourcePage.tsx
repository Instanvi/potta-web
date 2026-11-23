'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ErrorState, ListToolbar, PageContainer, Panel } from '@/app/(routes)/_shared/states';
import { Button } from '@/components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  FIELD_INPUT,
  SHEET_FIELD_INPUT,
  SHEET_FIELD_LABEL,
  SHEET_FIELD_SELECT,
  SHEET_FIELD_TEXTAREA,
} from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import {
  booksApi,
  type BooksResourceClient,
  cellValue,
  rowId,
} from '@/lib/books-api';
import { cn } from '@/lib/utils';
import SearchableSelect from '@/components/searchableSelect';
import { BooksLinesEditor } from '@/components/books/BooksLinesEditor';
import {
  BooksEntityKind,
  downloadBooksPdf,
  loadBooksEntityOptions,
  loadPurchaseOrderForReceipt,
} from '@/lib/books-entities';
import { TableSkeleton } from '@/components/ui/loaders';
import {
  useBooksResourceCreate,
  useBooksResourceList,
  useBooksResourceRemove,
  useBooksResourceUpdate,
} from '@/hooks/use-books-resource';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export type BooksColumn = { key: string; label: string };
export type BooksField = {
  key: string;
  label: string;
  /**
   * text | number | textarea | checkbox | date | lines | select | json |
   * customer | vendor | estimate | purchaseOrder | salesOrder |
   * invoice | bill | opportunity | lead | proposal | account
   */
  type?: string;
  options?: { value: string; label: string }[];
};

const ENTITY_FIELD_TYPES = new Set<string>([
  'customer',
  'vendor',
  'estimate',
  'purchaseOrder',
  'salesOrder',
  'invoice',
  'bill',
  'opportunity',
  'lead',
  'proposal',
  'account',
]);
export type BooksAction = { label: string; action: string; confirm?: boolean };

export type BooksResourcePageProps = {
  resourcePath: string;
  title: string;
  columns: BooksColumn[];
  fields: BooksField[];
  actions?: BooksAction[];
  /** Extra query params for list (page, limit, sortBy). */
  listParams?: Record<string, unknown>;
  /** Override CRUD client (e.g. expense projects via payrollClient). */
  api?: BooksResourceClient;
};

function coerceFormValue(type: string | undefined, raw: string): unknown {
  if (type === 'number') {
    if (raw.trim() === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  if (type === 'checkbox' || type === 'boolean') return raw === 'true' || raw === 'on';
  if (type === 'json' || type === 'lines') {
    if (!raw.trim()) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(type === 'lines' ? 'Invalid line items' : 'Invalid JSON');
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
  api = booksApi,
}: BooksResourcePageProps) {
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BooksAction | null>(null);

  const params = useMemo(
    () => ({ page: 1, limit: 50, sortBy: 'createdAt:DESC', ...listParams }),
    [listParams]
  );
  const filter = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (searchApplied.trim()) f.search = searchApplied.trim();
    return f;
  }, [searchApplied]);

  const listQuery = useBooksResourceList(resourcePath, filter, params, true, api);
  const createMutation = useBooksResourceCreate(resourcePath, api);
  const updateMutation = useBooksResourceUpdate(resourcePath, api);
  const removeMutation = useBooksResourceRemove(resourcePath, api);

  const rows = listQuery.data ?? [];
  const loading = listQuery.isLoading;
  const error = listQuery.error;
  const saving =
    createMutation.isPending || updateMutation.isPending || removeMutation.isPending;

  const load = () => listQuery.refetch();

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
      const detail = await api.get(resourcePath, id);
      const detailObj =
        detail && typeof detail === 'object' ? (detail as Record<string, unknown>) : null;
      const record = (detailObj?.data ?? detail) as Record<string, unknown>;
      setSelected(record && typeof record === 'object' ? record : row);
      const next: Record<string, string> = {};
      for (const f of fields) {
        const v = record?.[f.key];
        if (f.type === 'json' || f.type === 'lines')
          next[f.key] = v != null ? JSON.stringify(v) : '';
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
    try {
      const payload = buildPayload(fields, form);
      await createMutation.mutateAsync(payload);
      toast.success(`${title} created`);
      setCreateOpen(false);
    } catch {
      /* toast handled in hook */
    }
  };

  const handleUpdate = async () => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    try {
      const payload = buildPayload(fields, editForm);
      await updateMutation.mutateAsync({ id, body: payload });
      toast.success(`${title} updated`);
      setDetailOpen(false);
    } catch {
      /* toast handled in hook */
    }
  };

  const runDelete = async () => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    try {
      await removeMutation.mutateAsync(id);
      toast.success(`${title} deleted`);
      setConfirmDeleteOpen(false);
      setDetailOpen(false);
    } catch {
      /* toast handled in hook */
    }
  };

  const runAction = async (act: BooksAction) => {
    const id = selected ? rowId(selected) : '';
    if (!id) return;
    try {
      await api.action(resourcePath, id, act.action);
      toast.success(`${act.label} succeeded`);
      setPendingAction(null);
      setDetailOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `${act.label} failed`);
    }
  };

  const handleAction = (act: BooksAction) => {
    if (act.confirm) {
      setPendingAction(act);
      return;
    }
    void runAction(act);
  };

  return (
    <RootLayout>
      <PageContainer>
        <ListToolbar
          actions={
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                Refresh
              </Button>
              <Button type="button" size="sm" onClick={openCreate}>
                New {title}
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
            placeholder={`Search ${title.toLowerCase()}…`}
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <TableSkeleton rows={8} columns={Math.max(columns.length, 3)} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={`No ${title.toLowerCase()} yet`}
              action={
                <Button type="button" size="sm" onClick={openCreate}>
                  New {title}
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
              <BooksFormFields
                fields={fields}
                values={form}
                resourcePath={resourcePath}
                onChange={(key, v) => setForm((prev) => ({ ...prev, [key]: v }))}
                onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />
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
              <BooksFormFields
                fields={fields}
                values={editForm}
                resourcePath={resourcePath}
                onChange={(key, v) => setEditForm((prev) => ({ ...prev, [key]: v }))}
                onPatch={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
              />
            </div>
            <SheetFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  let lines: any[] = [];
                  try {
                    lines = editForm.lines ? JSON.parse(editForm.lines) : [];
                  } catch {
                    lines = [];
                  }
                  downloadBooksPdf({
                    title: selected
                      ? String(
                          selected.receiptNumber ??
                            selected.code ??
                            selected.orderNumber ??
                            title
                        )
                      : title,
                    subtitle: title,
                    fields: fields
                      .filter((f) => f.type !== 'lines' && f.type !== 'json')
                      .map((f) => ({
                        label: f.label,
                        value: editForm[f.key] ?? '',
                      })),
                    lines,
                  });
                }}
              >
                Download PDF
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={saving}
              >
                Delete
              </Button>
              {actions.map((act) => (
                <Button
                  key={act.action}
                  type="button"
                  variant="outline"
                  onClick={() => handleAction(act)}
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

        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title={`Delete ${title.toLowerCase()}?`}
          description={`This permanently deletes this ${title.toLowerCase()}. This cannot be undone.`}
          confirmText="Delete"
          destructive
          isLoading={removeMutation.isPending}
          onConfirm={() => void runDelete()}
        />
        <ConfirmDialog
          open={Boolean(pendingAction)}
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          title={pendingAction ? `${pendingAction.label}?` : 'Confirm'}
          description="Are you sure you want to continue?"
          confirmText={pendingAction?.label ?? 'Confirm'}
          destructive={false}
          isLoading={saving}
          onConfirm={() => {
            if (pendingAction) void runAction(pendingAction);
          }}
        />
      </PageContainer>
    </RootLayout>
  );
}

function BooksFormFields({
  fields,
  values,
  resourcePath,
  onChange,
  onPatch,
}: {
  fields: BooksField[];
  values: Record<string, string>;
  resourcePath: string;
  onChange: (key: string, value: string) => void;
  onPatch: (patch: Record<string, string>) => void;
}) {
  const [loadingPo, setLoadingPo] = useState(false);
  const confirmQuantities = resourcePath === 'item-receipt';

  const handleFieldChange = async (field: BooksField, next: string) => {
    onChange(field.key, next);

    // Goods receipt: selecting a PO loads vendor + ordered lines for qty confirmation.
    if (
      field.type === 'purchaseOrder' &&
      field.key === 'purchaseOrderId' &&
      resourcePath === 'item-receipt' &&
      next
    ) {
      setLoadingPo(true);
      try {
        const loaded = await loadPurchaseOrderForReceipt(next);
        onPatch({
          purchaseOrderId: next,
          ...(loaded.vendorId ? { vendorId: loaded.vendorId } : {}),
          lines: loaded.linesJson,
        });
        toast.success('Purchase order lines loaded — confirm received quantities');
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || 'Could not load purchase order');
      } finally {
        setLoadingPo(false);
      }
    }
  };

  return (
    <>
      {loadingPo ? (
        <p className="text-sm text-muted-foreground">Loading purchase order lines…</p>
      ) : null}
      {fields.map((f) => (
        <FieldInput
          key={f.key}
          field={f}
          value={values[f.key] ?? ''}
          confirmQuantities={confirmQuantities && f.type === 'lines'}
          onChange={(v) => void handleFieldChange(f, v)}
        />
      ))}
    </>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  confirmQuantities = false,
}: {
  field: BooksField;
  value: string;
  onChange: (v: string) => void;
  confirmQuantities?: boolean;
}) {
  const type = field.type || 'text';
  if (type === 'lines') {
    return (
      <BooksLinesEditor
        label={field.label}
        value={value}
        onChange={onChange}
        confirmQuantities={confirmQuantities}
      />
    );
  }
  if (ENTITY_FIELD_TYPES.has(type)) {
    return (
      <EntitySelectField
        entity={type as BooksEntityKind}
        label={field.label}
        value={value}
        onChange={onChange}
      />
    );
  }
  if (type === 'select') {
    const options = field.options ?? [];
    return (
      <label className="block space-y-1">
        <span className={SHEET_FIELD_LABEL}>{field.label}</span>
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className={cn(SHEET_FIELD_SELECT, 'h-10')}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    );
  }
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

function EntitySelectField({
  entity,
  label,
  value,
  onChange,
}: {
  entity: BooksEntityKind;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const next = await loadBooksEntityOptions(entity);
        if (!cancelled) setOptions(next.filter((o) => o.value));
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entity]);

  return (
    <SearchableSelect
      label={label}
      required={entity === 'customer' || entity === 'purchaseOrder'}
      options={options}
      selectedValue={value}
      onChange={onChange}
      placeholder={loading ? 'Loading…' : `Select ${label.toLowerCase()}`}
      isDisabled={loading}
    />
  );
}

export default BooksResourcePage;
