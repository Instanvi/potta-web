'use client';
import React, { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from '@phosphor-icons/react';
import Select from '@potta/components/select';
import { useCreateTax, useTaxes } from '@potta/app/(routes)/accounting/taxes/hooks';
import useGetAllProductCategories from '../../_hooks/useGetAllProductCategories';
import useCreateProductCategory from '../../_hooks/useCreateProductCategory';

/** Mirrors potta-backend ProductUnitOfMeasure. */
export const UNIT_OPTIONS = [
  { label: 'Pieces', value: 'Pieces' },
  { label: 'Litres', value: 'litres' },
  { label: 'Gallons', value: 'Gallons' },
  { label: 'Other', value: 'Other' },
];

export const STATUS_OPTIONS = [
  { label: 'Enabled (can be sold)', value: 'enabled' },
  { label: 'Disabled (hidden from sales)', value: 'disabled' },
];

/** Titled block of the item form. */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-[2px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
  </section>
);

export const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="mt-1 text-xs text-muted-foreground">{children}</p>
);

const InlineCreate = ({
  label,
  onCancel,
  onSave,
  saving,
  children,
}: {
  label: string;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
}) => (
  <div className="mt-2 space-y-2 rounded-[2px] border border-dashed border-black/15 bg-brand-subtle/40 p-3">
    <p className="text-xs font-medium text-foreground">{label}</p>
    {children}
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground">
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="h-8 rounded-[2px] bg-primary px-3 text-xs font-medium text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  </div>
);

const inlineInput =
  'h-9 w-full rounded-[2px] border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-ring/30';

const AddLink = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button type="button" onClick={onClick} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
    <Plus size={12} /> {children}
  </button>
);

/** Category picker that can create a category in place. */
export const CategoryField = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const { data } = useGetAllProductCategories({ limit: 100 });
  const createCategory = useCreateProductCategory();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const options = (data?.data || []).map((c: { uuid: string; name: string }) => ({ label: c.name, value: c.uuid }));

  const save = async () => {
    if (!name.trim()) return toast.error('Category name is required');
    try {
      const created = await createCategory.mutateAsync({ name: name.trim(), description: description.trim() });
      const id = created?.uuid ?? created?.data?.uuid;
      if (id) onChange(id);
      toast.success(`Category "${name.trim()}" created`);
      setName('');
      setDescription('');
      setAdding(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not create the category');
    }
  };

  return (
    <div>
      <Select
        label="Category"
        options={options}
        selectedValue={value || ''}
        onChange={onChange}
        bg="bg-white"
        name="category"
        placeholder={options.length ? 'Choose a category' : 'No categories yet'}
        error={error}
      />
      {adding ? (
        <InlineCreate label="New category" onCancel={() => setAdding(false)} onSave={save} saving={createCategory.isPending}>
          <input className={inlineInput} placeholder="Name, e.g. Beverages" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className={inlineInput}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </InlineCreate>
      ) : (
        <AddLink onClick={() => setAdding(true)}>New category</AddLink>
      )}
    </div>
  );
};

/** Tax picker that can create a percentage or fixed tax in place. */
export const TaxField = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const { data } = useTaxes({ page: 1, limit: 100 });
  const createTax = useCreateTax();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [amount, setAmount] = useState('');

  const options = (data?.data || []).map((tax) => ({
    label: tax.type === 'FIXED' ? `${tax.name} (${Number(tax.flatRate ?? 0)} fixed)` : `${tax.name} (${Number(tax.rate ?? 0)}%)`,
    value: tax.uuid,
  }));

  const save = async () => {
    const n = Number(amount);
    if (!name.trim()) return toast.error('Tax name is required');
    if (!Number.isFinite(n) || n < 0 || (type === 'PERCENTAGE' && n > 100)) {
      return toast.error(type === 'PERCENTAGE' ? 'Rate must be between 0 and 100' : 'Amount must be 0 or more');
    }
    try {
      const created = await createTax.mutateAsync({
        name: name.trim(),
        type,
        isActive: true,
        ...(type === 'PERCENTAGE' ? { rate: n } : { flatRate: n, rate: 0 }),
      });
      if (created?.uuid) onChange(created.uuid);
      setName('');
      setAmount('');
      setAdding(false);
    } catch {
      // useCreateTax already shows the error.
    }
  };

  return (
    <div>
      <Select
        label="Tax"
        options={options}
        selectedValue={value || ''}
        onChange={onChange}
        bg="bg-white"
        name="tax"
        placeholder={options.length ? 'Choose the tax to apply' : 'No taxes yet'}
        error={error}
      />
      {adding ? (
        <InlineCreate label="New tax" onCancel={() => setAdding(false)} onSave={save} saving={createTax.isPending}>
          <input className={inlineInput} placeholder="Name, e.g. VAT" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <select
              className={`${inlineInput} w-40`}
              value={type}
              onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </select>
            <input
              className={inlineInput}
              type="number"
              min={0}
              placeholder={type === 'PERCENTAGE' ? 'Rate %, e.g. 19.25' : 'Amount per unit'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </InlineCreate>
      ) : (
        <AddLink onClick={() => setAdding(true)}>New tax</AddLink>
      )}
    </div>
  );
};

/** Margin line under the prices. */
export const MarginHint = ({ cost, price }: { cost: unknown; price: unknown }) => {
  const c = Number(cost) || 0;
  const p = Number(price) || 0;
  if (!p) return null;
  const margin = p - c;
  const pct = (margin / p) * 100;
  return (
    <p className={`mt-1 text-xs ${margin < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
      Margin {margin.toLocaleString()} per unit ({pct.toFixed(1)}%){margin < 0 ? ' — selling below cost' : ''}
    </p>
  );
};

export const generateSku = (name: string) => {
  const prefix =
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 12) || 'ITEM';
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};
