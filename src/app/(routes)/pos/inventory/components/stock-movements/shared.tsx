import React, { ReactNode } from 'react';
import Button from '@potta/components/button';
import Select from '@potta/components/select';
import SearchableSelect from '@potta/components/searchableSelect';
import { StatusBadge } from '../../../../_shared/states';
import useGetAllProducts from '../../_hooks/useGetAllProducts';
import type { Product } from '../../_utils/types';
import { FieldHint } from '../fields/ItemFormFields';

export const inputClass =
  'mt-2 h-[42px] w-full rounded-[2px] border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-ring/30';

export const panelClass =
  'space-y-4 rounded-[2px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  PROCESSED: 'success',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSED: 'Processed',
  APPROVED: 'Applied',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const MovementStatus = ({ status }: { status: string }) => (
  <StatusBadge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</StatusBadge>
);

export const ItemCell = ({ product }: { product?: { name?: string; sku?: string | null } | null }) => (
  <div className="min-w-0">
    <p className="truncate font-medium text-foreground">{product?.name ?? 'Deleted item'}</p>
    {product?.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
  </div>
);

/** Search box plus status filter; `extra` holds additional filters. */
export const MovementFilters = ({
  search,
  onSearch,
  status,
  onStatus,
  statusOptions,
  extra,
}: {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  statusOptions: { value: string; label: string }[];
  extra?: ReactNode;
}) => (
  <>
    <input
      className="h-[38px] w-full max-w-xs rounded-[2px] border border-input bg-white px-3 text-sm outline-none focus:border-primary"
      placeholder="Search item name or SKU"
      value={search}
      onChange={(e) => onSearch(e.target.value)}
    />
    <div className="w-44">
      <Select
        bg="bg-white"
        options={[{ value: '', label: 'All statuses' }, ...statusOptions]}
        selectedValue={status}
        onChange={onStatus}
        placeholder="All statuses"
      />
    </div>
    {extra}
  </>
);

/** Item picker for movement forms; shows on-hand stock once an item is chosen. */
export const StockItemPicker = ({
  product,
  onChange,
  label,
  hint,
}: {
  product: Product | null;
  onChange: (p: Product | null) => void;
  label: string;
  hint?: string;
}) => {
  const { data } = useGetAllProducts({ limit: 100, page: 1 });
  const stocked = (data?.data ?? []).filter((p) => p.type !== 'NON_INVENTORY');
  return (
    <div>
      <SearchableSelect
        label={label}
        options={stocked.map((p) => ({ value: p.uuid, label: p.sku ? `${p.name} (${p.sku})` : p.name }))}
        selectedValue={product?.uuid ?? ''}
        onChange={(value: string) => onChange(stocked.find((p) => p.uuid === value) ?? null)}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
};

export const StockFacts = ({ facts }: { facts: { label: string; value: ReactNode }[] }) => (
  <div className="grid grid-cols-3 gap-3 rounded-[2px] bg-brand-subtle/50 p-3 text-sm">
    {facts.map((f) => (
      <div key={f.label}>
        <p className="text-xs text-muted-foreground">{f.label}</p>
        <p className="font-medium tabular-nums">{f.value}</p>
      </div>
    ))}
  </div>
);

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText,
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmText: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) =>
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-[2px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-medium">{title}</h3>
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button text="Cancel" type="button" theme="gray" onClick={onClose} />
          <Button
            text={confirmText}
            type="button"
            theme={danger ? 'red' : 'default'}
            isLoading={loading}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  ) : null;

export const RowActions = ({
  pending,
  primaryLabel,
  onPrimary,
  onReject,
}: {
  pending: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  onReject: () => void;
}) =>
  pending ? (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onPrimary}
        className="h-8 rounded-[2px] bg-primary px-3 text-xs font-medium text-white hover:opacity-90"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReject}
        className="h-8 rounded-[2px] border border-input px-3 text-xs font-medium text-destructive hover:bg-destructive/10"
      >
        Reject
      </button>
    </div>
  ) : (
    <span className="block text-right text-xs text-muted-foreground">—</span>
  );
