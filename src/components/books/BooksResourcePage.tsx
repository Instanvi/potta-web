'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FIELD_INPUT } from '@/lib/field-styles';
import {
  booksApi,
  extractBooksMeta,
  extractBooksRows,
  type BooksResourceClient,
  rowId,
} from '@/lib/books-api';
import { cn } from '@/lib/utils';
import { downloadBooksPdf } from '@/lib/books-entities';
import { useDataTableHandle } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { ExportButton } from '@/components/export-button';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { useServerPagination } from '@/hooks/use-server-pagination';
import {
  DocumentChannelMenu,
  documentChannelOptions,
  partyContactFromRecord,
  type DocumentChannel,
} from '@/components/document-channel-menu';
import { sendPartyDocument } from '@/lib/document-send';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { orgToSeller } from '@/lib/org-to-seller';
import {
  useBooksResourceCreate,
  useBooksResourceList,
  useBooksResourceRemove,
  useBooksResourceUpdate,
} from '@/hooks/use-books-resource';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  BooksFormFields,
  buildPayload,
  type BooksAction,
  type BooksField,
} from '@/components/books/books-form-fields';
import { useBooksLabelMaps } from '@/hooks/use-books-label-maps';

export type { BooksAction, BooksField };
export type BooksColumn = { key: string; label: string; type?: string };

export type BooksResourcePageProps = {
  resourcePath: string;
  title: string;
  columns: BooksColumn[];
  fields: BooksField[];
  actions?: BooksAction[];
  /** When set, New navigates here instead of opening the create sheet. */
  createHref?: string;
  /** When set, shows Email/SMS send (versioned download links). */
  documentKind?:
    | 'estimate'
    | 'sales_order'
    | 'sales_receipt'
    | 'shipment'
    | 'supplier_credit'
    | 'item_receipt'
    | 'proposal'
    | 'contract'
    | 'purchase_order'
    | 'credit_note';
  /** Extra query params for list (page, limit, sortBy). */
  listParams?: Record<string, unknown>;
  /** Override CRUD client (e.g. expense projects via payrollClient). */
  api?: BooksResourceClient;
};

export function BooksResourcePage({
  resourcePath,
  title,
  columns,
  fields,
  actions = [],
  createHref,
  documentKind,
  listParams,
  api = booksApi,
}: BooksResourcePageProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BooksAction | null>(null);
  const [sendChannel, setSendChannel] = useState<DocumentChannel | null>(null);
  const [sending, setSending] = useState(false);
  const { data: org } = useOrganizationProfile();

  const filter = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (searchApplied.trim()) f.search = searchApplied.trim();
    return f;
  }, [searchApplied]);

  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [searchApplied, resourcePath, JSON.stringify(listParams ?? {})],
  });
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();
  const { formatCell } = useBooksLabelMaps(columns, fields);

  // page/limit come from server pagination state; listParams may still set sortBy etc.
  const baseParams = useMemo(
    () => ({ sortBy: 'createdAt:DESC', ...listParams }),
    [listParams]
  );
  const params = useMemo(
    () => ({ ...baseParams, page, limit }),
    [baseParams, page, limit]
  );

  const listQuery = useBooksResourceList(resourcePath, filter, params, true, api);
  const createMutation = useBooksResourceCreate(resourcePath, api);
  const updateMutation = useBooksResourceUpdate(resourcePath, api);
  const removeMutation = useBooksResourceRemove(resourcePath, api);

  const rows = listQuery.data?.rows ?? [];
  const meta = listQuery.data?.meta;
  const loading = listQuery.isLoading;
  const error = listQuery.error;
  const saving =
    createMutation.isPending || updateMutation.isPending || removeMutation.isPending;

  const load = () => listQuery.refetch();

  const exportColumns = useMemo(
    () =>
      columns.map((c) => ({
        key: c.key,
        header: c.label,
        value: (row: Record<string, unknown>) => {
          const v = formatCell(row, c.key, c.type);
          return v === '—' ? '' : v;
        },
      })),
    [columns, formatCell]
  );

  const fetchAllRows = () =>
    fetchAllPages<Record<string, unknown>>(async (p, l) => {
      const raw = await api.list(resourcePath, filter, { ...baseParams, page: p, limit: l });
      return { data: extractBooksRows(raw), meta: extractBooksMeta(raw) ?? undefined };
    });

  const openCreate = () => {
    if (createHref) {
      router.push(createHref);
      return;
    }
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
              {table ? <DataTableViewOptions table={table} /> : null}
              <ExportButton
                filename={resourcePath.replace(/\//g, '-')}
                rows={rows}
                columns={exportColumns}
                fetchAllRows={fetchAllRows}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => void load()}
                disabled={loading}
                aria-label="Refresh"
                title="Refresh"
              >
                <i className={`ri-refresh-line text-base ${loading ? 'animate-spin' : ''}`} />
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
          ) : (
            <BooksListTable
              columns={columns}
              rows={rows}
              isLoading={loading}
              emptyMessage={`No ${title.toLowerCase()} yet`}
              onRowClick={(row) => void openDetail(row)}
              storageKey={`books-${resourcePath.replace(/\//g, '-')}-table`}
              serverPagination={tableProps(meta, rows.length)}
              showViewOptions={false}
              onTableChange={onTableChange}
              formatCell={formatCell}
            />
          )}
        </div>

        {!createHref ? (
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
        ) : null}

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
                  void (async () => {
                    let lines: any[] = [];
                    try {
                      lines = editForm.lines ? JSON.parse(editForm.lines) : [];
                    } catch {
                      lines = [];
                    }
                    try {
                      await downloadBooksPdf({
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
                          .map((f) => {
                            const row = {
                              ...(selected ?? {}),
                              [f.key]: editForm[f.key] ?? '',
                            } as Record<string, unknown>;
                            return {
                              label: f.label,
                              value: formatCell(row, f.key, f.type),
                            };
                          }),
                        lines,
                        seller: orgToSeller(org),
                        currency: editForm.currency || undefined,
                      });
                    } catch (err) {
                      console.error(err);
                      toast.error('Could not download PDF');
                    }
                  })();
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
              {documentKind && selected ? (
                <DocumentChannelMenu
                  label={selected.lastSentAt ? 'Resend' : 'Send'}
                  disabled={sending}
                  options={documentChannelOptions(
                    partyContactFromRecord(selected),
                  )}
                  onSelect={(channel) => setSendChannel(channel)}
                />
              ) : null}
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
          open={Boolean(sendChannel && selected && documentKind)}
          onOpenChange={(open) => {
            if (!open) setSendChannel(null);
          }}
          title={`${selected?.lastSentAt ? 'Resend' : 'Send'} ${title.toLowerCase()}?`}
          description={
            sendChannel === 'sms'
              ? `Send this ${title.toLowerCase()} by SMS?${
                  selected?.lastSentAt ? ' The previous download link will stop working.' : ''
                }`
              : `Send this ${title.toLowerCase()} by email?${
                  selected?.lastSentAt ? ' The previous download link will stop working.' : ''
                }`
          }
          confirmText={selected?.lastSentAt ? 'Resend' : 'Send'}
          destructive={false}
          isLoading={sending}
          onConfirm={() => {
            if (!selected || !documentKind || !sendChannel) return;
            const id = rowId(selected);
            if (!id) return;
            setSending(true);
            const party = partyContactFromRecord(selected);
            void sendPartyDocument(documentKind, id, {
              channel: sendChannel,
              to: sendChannel === 'email' ? party.email : undefined,
              phone: sendChannel === 'sms' ? party.phone : undefined,
            })
              .then((res) => {
                toast.success(
                  res.channel === 'sms'
                    ? `${title} texted to ${res.to}`
                    : `${title} emailed to ${res.to}`,
                );
                setSendChannel(null);
              })
              .catch((err: unknown) => {
                const message =
                  err && typeof err === 'object' && 'response' in err
                    ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message || '')
                    : '';
                toast.error(message || `Failed to send ${title.toLowerCase()}`);
              })
              .finally(() => setSending(false));
          }}
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

export default BooksResourcePage;
