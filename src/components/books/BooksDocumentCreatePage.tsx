'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DocumentWorkspace from '@/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
  usePreviewDownload,
} from '@/components/document-editor-split';
import {
  DocumentFooterLink,
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@/components/document-form-layout';
import { Button } from '@/components/shadcn/button';
import { LocationSwitcher } from '@/components/shell/location-switcher';
import { BooksDocumentPreview } from '@/components/books/BooksDocumentPreview';
import { SelectedParty } from '@/components/books/selected-party';
import {
  BooksFormFields,
  buildPayload,
  type BooksAction,
  type BooksField,
} from '@/components/books/books-form-fields';
import { booksApi, rowId } from '@/lib/books-api';

/** Party + related-document pickers shown in the first card. */
const PARTY_TYPES = new Set([
  'customer',
  'vendor',
  'bill',
  'purchaseOrder',
  'estimate',
  'opportunity',
]);

export type BooksDocumentCreatePageProps = {
  resourcePath: string;
  title: string;
  closeHref: string;
  fields: BooksField[];
  /** Shown after create when an id is available (e.g. post-inventory). */
  postActions?: BooksAction[];
};

export function BooksDocumentCreatePage({
  resourcePath,
  title,
  closeHref,
  fields,
  postActions = [],
}: BooksDocumentCreatePageProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.type === 'checkbox' ? 'false' : '';
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();

  const { partyFields, dateFields, lineFields, noteFields, detailFields } = useMemo(() => {
    const party: BooksField[] = [];
    const dates: BooksField[] = [];
    const lines: BooksField[] = [];
    const notes: BooksField[] = [];
    const details: BooksField[] = [];
    for (const f of fields) {
      if (f.type === 'lines') lines.push(f);
      else if (f.type && PARTY_TYPES.has(f.type)) party.push(f);
      else if (f.type === 'date') dates.push(f);
      else if (f.type === 'textarea' || f.type === 'json') notes.push(f);
      else details.push(f);
    }
    return {
      partyFields: party,
      dateFields: dates,
      lineFields: lines,
      noteFields: notes,
      detailFields: details,
    };
  }, [fields]);

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const onPatch = (patch: Record<string, string>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload(fields, form);
      const created = await booksApi.create(resourcePath, payload);
      const createdObj =
        created && typeof created === 'object'
          ? (created as Record<string, unknown>)
          : null;
      const record = (createdObj?.data ?? created) as Record<string, unknown> | null;
      const id = record && typeof record === 'object' ? rowId(record) : '';
      toast.success(`${title} created`);
      if (id && postActions.length > 0) {
        setCreatedId(id);
        return;
      }
      router.push(closeHref);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        err?.response?.data?.message || err?.message || `Failed to create ${title}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const runPostAction = async (act: BooksAction) => {
    if (!createdId) {
      toast.error('Save the document first');
      return;
    }
    setActing(true);
    try {
      await booksApi.action(resourcePath, createdId, act.action);
      toast.success(`${act.label} succeeded`);
      router.push(closeHref);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || `${act.label} failed`);
    } finally {
      setActing(false);
    }
  };

  const customerId = form.customerId ?? '';
  const vendorId = form.vendorId ?? '';
  const asksForParty = partyFields.some(
    (field) => field.type === 'customer' || field.type === 'vendor',
  );

  return (
    <DocumentWorkspace
      title={`New ${title}`}
      closeHref={closeHref}
      className="bg-white"
      bodyClassName="flex flex-col overflow-hidden bg-white"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle
            open={showPreview}
            onToggle={() => setShowPreview((open) => !open)}
          />
        </>
      }
    >
      <DocumentEditorSplit
        open={showPreview}
        onOpenChange={setShowPreview}
        downloadTitle={title}
        onDownloadPdf={onDownloadPdf}
        editor={
          <div className="flex min-h-full flex-col bg-white">
            <DocumentFormShell className="flex-1 bg-white">
              {partyFields.length > 0 ? (
                <DocumentFormCard flush>
                  <DocumentSectionTitle>Who it&apos;s for</DocumentSectionTitle>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <BooksFormFields
                      fields={partyFields}
                      values={form}
                      resourcePath={resourcePath}
                      onChange={onChange}
                      onPatch={onPatch}
                    />
                    {customerId ? <SelectedParty kind="customer" id={customerId} /> : null}
                    {vendorId ? <SelectedParty kind="vendor" id={vendorId} /> : null}
                    {asksForParty && !customerId && !vendorId ? (
                      <p className="text-sm text-muted-foreground md:col-span-2">
                        Select a customer or vendor to see their contact details.
                      </p>
                    ) : null}
                  </div>
                </DocumentFormCard>
              ) : null}

              {dateFields.length > 0 ? (
                <DocumentFormCard flush>
                  <DocumentSectionTitle>Dates</DocumentSectionTitle>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <BooksFormFields
                      fields={dateFields}
                      values={form}
                      resourcePath={resourcePath}
                      onChange={onChange}
                      onPatch={onPatch}
                    />
                  </div>
                </DocumentFormCard>
              ) : null}

              {detailFields.length > 0 ? (
                <DocumentFormCard flush>
                  <DocumentSectionTitle>Details</DocumentSectionTitle>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <BooksFormFields
                      fields={detailFields}
                      values={form}
                      resourcePath={resourcePath}
                      onChange={onChange}
                      onPatch={onPatch}
                    />
                  </div>
                </DocumentFormCard>
              ) : null}

              {noteFields.length > 0 ? (
                <DocumentFormCard flush>
                  <DocumentSectionTitle>Notes</DocumentSectionTitle>
                  <BooksFormFields
                    fields={noteFields}
                    values={form}
                    resourcePath={resourcePath}
                    onChange={onChange}
                    onPatch={onPatch}
                  />
                </DocumentFormCard>
              ) : null}

              {lineFields.length > 0 ? (
                <DocumentFormCard flush>
                  <DocumentSectionTitle>Line items</DocumentSectionTitle>
                  <BooksFormFields
                    fields={lineFields}
                    values={form}
                    resourcePath={resourcePath}
                    onChange={onChange}
                    onPatch={onPatch}
                  />
                </DocumentFormCard>
              ) : null}
            </DocumentFormShell>

            <DocumentFormFooter
              left={
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => router.push(closeHref)}
                >
                  Cancel
                </Button>
              }
              center={
                <DocumentFooterLink onClick={() => setShowPreview(true)}>
                  Print or Preview
                </DocumentFooterLink>
              }
              right={
                <>
                  {createdId
                    ? postActions.map((act) => (
                        <Button
                          key={act.action}
                          type="button"
                          variant="outline"
                          className="border-white/40 bg-white text-foreground hover:bg-white/90"
                          disabled={acting || saving}
                          onClick={() => void runPostAction(act)}
                        >
                          {acting ? 'Working…' : act.label}
                        </Button>
                      ))
                    : null}
                  {!createdId ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/40 bg-white text-foreground hover:bg-white/90"
                      disabled={saving}
                      onClick={() => void handleSave()}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/40 bg-white text-foreground hover:bg-white/90"
                      disabled={acting}
                      onClick={() => router.push(closeHref)}
                    >
                      Done
                    </Button>
                  )}
                </>
              }
            />
          </div>
        }
        preview={
          <BooksDocumentPreview
            title={title}
            fields={fields}
            values={form}
            onRegisterDownload={registerDownload}
          />
        }
      />
    </DocumentWorkspace>
  );
}

export default BooksDocumentCreatePage;
