'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DocumentWorkspace from '@/components/document-workspace';
import {
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@/components/document-form-layout';
import { Button } from '@/components/shadcn/button';
import { LocationSwitcher } from '@/components/shell/location-switcher';
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

  const { partyFields, dateFields, lineFields, otherFields } = useMemo(() => {
    const party: BooksField[] = [];
    const dates: BooksField[] = [];
    const lines: BooksField[] = [];
    const other: BooksField[] = [];
    for (const f of fields) {
      if (f.type === 'lines') lines.push(f);
      else if (f.type && PARTY_TYPES.has(f.type)) party.push(f);
      else if (f.type === 'date') dates.push(f);
      else other.push(f);
    }
    return {
      partyFields: party,
      dateFields: dates,
      lineFields: lines,
      otherFields: other,
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

  return (
    <DocumentWorkspace
      title={`New ${title}`}
      closeHref={closeHref}
      className="bg-white"
      bodyClassName="bg-white"
      headerActions={<LocationSwitcher />}
    >
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <DocumentFormShell className="bg-white">
            {partyFields.length > 0 ? (
              <DocumentFormCard flush>
                <DocumentSectionTitle>Party</DocumentSectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BooksFormFields
                    fields={partyFields}
                    values={form}
                    resourcePath={resourcePath}
                    onChange={onChange}
                    onPatch={onPatch}
                  />
                </div>
              </DocumentFormCard>
            ) : null}

            {dateFields.length > 0 ? (
              <DocumentFormCard flush>
                <DocumentSectionTitle>Dates</DocumentSectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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

            {otherFields.length > 0 ? (
              <DocumentFormCard flush>
                <DocumentSectionTitle>Details</DocumentSectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <BooksFormFields
                    fields={otherFields}
                    values={form}
                    resourcePath={resourcePath}
                    onChange={onChange}
                    onPatch={onPatch}
                  />
                </div>
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
        </div>

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
    </DocumentWorkspace>
  );
}

export default BooksDocumentCreatePage;
