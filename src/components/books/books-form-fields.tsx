'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import {
  FIELD_INPUT,
  FIELD_LABEL,
  FIELD_NO_SPIN,
  FIELD_SELECT,
  FIELD_TEXTAREA,
} from '@/lib/field-styles';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import SearchableSelect from '@/components/searchableSelect';
import { BooksLinesEditor } from '@/components/books/BooksLinesEditor';
import SliderCustomer from '@potta/app/(routes)/customers/components/customerSlider';
import SliderVendor from '@potta/app/(routes)/vendors/components/vendorSlider';
import {
  BooksEntityKind,
  loadBillForSupplierCredit,
  loadBooksEntityOptions,
  loadPurchaseOrderForReceipt,
} from '@/lib/books-entities';
import { sanitizeDocumentPayload } from '@/lib/document-api-fields';

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

export type BooksAction = { label: string; action: string; confirm?: boolean };

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

export function coerceFormValue(type: string | undefined, raw: string): unknown {
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

export function buildPayload(
  fields: BooksField[],
  values: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = values[f.key] ?? '';
    const coerced = coerceFormValue(f.type, raw);
    if (coerced !== undefined) out[f.key] = coerced;
  }
  // Estimates, proposals, sales orders, credits, receipts, and Books CRUD
  // share this builder — strip empty/short notes & terms the API rejects.
  return sanitizeDocumentPayload(out);
}

export function BooksFormFields({
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
  const [loadingRelated, setLoadingRelated] = useState(false);
  const confirmQuantities = resourcePath === 'item-receipt';

  const handleFieldChange = async (field: BooksField, next: string) => {
    onChange(field.key, next);

    if (
      field.type === 'purchaseOrder' &&
      field.key === 'purchaseOrderId' &&
      resourcePath === 'item-receipt' &&
      next
    ) {
      setLoadingRelated(true);
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
        setLoadingRelated(false);
      }
    }

    if (
      field.type === 'bill' &&
      field.key === 'billId' &&
      resourcePath === 'supplier-credit' &&
      next
    ) {
      setLoadingRelated(true);
      try {
        const loaded = await loadBillForSupplierCredit(next);
        onPatch({
          billId: next,
          ...(loaded.vendorId ? { vendorId: loaded.vendorId } : {}),
          lines: loaded.linesJson,
        });
        toast.success('Bill lines loaded');
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || 'Could not load bill');
      } finally {
        setLoadingRelated(false);
      }
    }
  };

  return (
    <>
      {loadingRelated ? (
        <p className="text-sm text-muted-foreground">Loading related document…</p>
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

export function FieldInput({
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
        <span className={FIELD_LABEL}>{field.label}</span>
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className={cn(FIELD_SELECT, 'h-10')}>
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
        <span className={FIELD_LABEL}>{field.label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={type === 'json' ? 6 : 3}
          className={FIELD_TEXTAREA}
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
      <span className={FIELD_LABEL}>{field.label}</span>
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD_INPUT, type === 'number' && FIELD_NO_SPIN)}
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
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = entity === 'customer' || entity === 'vendor';

  const reload = async () => {
    setLoading(true);
    try {
      const next = await loadBooksEntityOptions(entity);
      setOptions(next.filter((o) => o.value));
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-1">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <SearchableSelect
            label={label}
            required={entity === 'customer' || entity === 'purchaseOrder'}
            options={options}
            selectedValue={value}
            onChange={onChange}
            placeholder={loading ? 'Loading…' : `Select ${label.toLowerCase()}`}
            isDisabled={loading}
            outlined
          />
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-white hover:bg-brand-hover"
            aria-label={`Add ${label.toLowerCase()}`}
            title={`Add ${label.toLowerCase()}`}
          >
            <i className="ri-add-line text-xl" />
          </button>
        ) : null}
      </div>
      {entity === 'customer' ? (
        <SliderCustomer
          open={createOpen}
          setOpen={setCreateOpen}
          showTrigger={false}
        />
      ) : null}
      {entity === 'vendor' ? (
        <SliderVendor
          open={createOpen}
          setOpen={setCreateOpen}
          showTrigger={false}
          onCreated={(id) => {
            void reload().then(() => {
              if (id) onChange(id);
            });
          }}
        />
      ) : null}
    </div>
  );
}
