'use client';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { productApi } from '@potta/app/(routes)/pos/inventory/_utils/api';
import type { Product } from '@potta/app/(routes)/pos/inventory/_utils/types';
import { priceCatalogSelection } from '@/lib/catalog-price';
import { productToLine, type SaleLineItem } from '@potta/app/(routes)/pos/utils/sale';

export function productNeedsChooser(product: Product) {
  return Boolean(
    product.hasVariations ||
      product.hasModifiers ||
      (product.variations && product.variations.length) ||
      (product.packagePrices && product.packagePrices.length),
  );
}

const NONE = '__none__';

/** Optional shadcn select; choosing the placeholder row clears the value. */
function OptionalSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select
      value={value || NONE}
      onValueChange={(v) => onChange(v === NONE ? '' : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function ProductChooser({
  productId,
  open,
  onClose,
  onConfirm,
}: {
  productId: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (line: SaleLineItem) => void;
}) {
  const [detail, setDetail] = useState<Product | null>(null);
  const [variationId, setVariationId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [modifierIds, setModifierIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !productId) return;
    productApi.getOne(productId).then((p) => {
      setDetail(p);
      setVariationId('');
      setPackageId('');
      setUnitId('');
      setModifierIds([]);
    });
  }, [open, productId]);

  if (!open) return null;
  const variation = detail?.variations?.find((v) => v.uuid === variationId);
  const packages = [...(detail?.packagePrices ?? []), ...(detail?.variationPackagePrices ?? [])];
  const pkg = packages.find((p) => p.uuid === packageId);
  const units = (detail?.unitAssignments ?? []).map((a) => a.unit);
  const unit = units.find((u) => u.uuid === unitId);
  const modifiers = [...(detail?.modifiers ?? []), ...(detail?.orgModifiers ?? [])];
  const chosen = modifiers.filter((m) => modifierIds.includes(m.uuid));
  const priced = detail
    ? priceCatalogSelection({ product: detail, variation, packagePrice: pkg, unit, modifiers: chosen })
    : { unitPrice: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md space-y-3 rounded-[2px] bg-white p-5">
        <h3 className="text-lg font-medium">{detail?.name ?? 'Choose options'}</h3>
        {(detail?.variations?.length ?? 0) > 0 && (
          <OptionalSelect
            value={variationId}
            onChange={setVariationId}
            placeholder="Variation"
            options={detail!.variations!.map((v) => ({ value: v.uuid, label: v.name || v.sku || v.uuid }))}
          />
        )}
        {packages.length > 0 && (
          <OptionalSelect
            value={packageId}
            onChange={setPackageId}
            placeholder="Package"
            options={packages.map((p) => ({ value: p.uuid, label: p.packageName }))}
          />
        )}
        {units.length > 0 && (
          <OptionalSelect
            value={unitId}
            onChange={setUnitId}
            placeholder="Unit"
            options={units.map((u) => ({ value: u.uuid, label: u.name }))}
          />
        )}
        {modifiers.map((m) => (
          <label key={m.uuid} className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={modifierIds.includes(m.uuid)}
              onChange={(e) =>
                setModifierIds((ids) => (e.target.checked ? [...ids, m.uuid] : ids.filter((id) => id !== m.uuid)))
              }
            />
            {m.name} (+{m.price})
          </label>
        ))}
        <div className="flex justify-end gap-2">
          <button type="button" className="h-12 px-3 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="h-12 bg-primary px-3 text-sm text-white"
            onClick={() => {
              if (!detail) return;
              onConfirm(
                productToLine(detail, {
                  description: [detail.name, variation?.name, pkg?.packageName].filter(Boolean).join(' · '),
                  unitPrice: priced.unitPrice,
                  variationId: variationId || undefined,
                  packagePriceId: packageId || undefined,
                  unitId: unitId || undefined,
                  modifierIds,
                }),
              );
              onClose();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
