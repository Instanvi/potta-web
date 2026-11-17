'use client';
import { useContext, useEffect, useState } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import SearchSelect, { Option } from '@potta/components/search-select';
import useGetAllProducts from '@potta/app/(routes)/pos/inventory/_hooks/useGetAllProducts';
import { productApi } from '@potta/app/(routes)/pos/inventory/_utils/api';
import type { PackagePrice, Product, ProductModifier, ProductVariation, Unit } from '@potta/app/(routes)/pos/inventory/_utils/types';
import { lineKey } from '@potta/app/(routes)/pos/inventory/_utils/types';
import { priceCatalogSelection } from '@/lib/catalog-price';
import { FIELD_INPUT, FIELD_SELECT } from '@/lib/field-styles';

const getCurrencySymbol = (currencyCode: string): string => {
  if (currencyCode === 'USD') return '$';
  if (currencyCode === 'EUR') return '€';
  if (currencyCode === 'GBP') return '£';
  return currencyCode || 'XAF';
};

type TableRow = {
  id: number;
  uuid: string;
  productId: string;
  name: string;
  qty: number;
  price: number;
  tax: number;
  variationId?: string | null;
  packagePriceId?: string | null;
  unitId?: string | null;
  modifierIds?: string[];
  lineKey: string;
};

export default function ProductLinesTable() {
  const context = useContext(ContextData);
  const [rows, setRows] = useState<TableRow[]>(context?.data?.table || []);
  const [productId, setProductId] = useState('');
  const [detail, setDetail] = useState<Product | null>(null);
  const [variationId, setVariationId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState<{ product?: string; quantity?: string }>({});

  const currency = context?.data?.currency || 'XAF';
  const currencySymbol = getCurrencySymbol(currency);
  const { data: productsData, isLoading } = useGetAllProducts({ page: 1, limit: 100 });
  const products: Product[] = productsData?.data || [];

  useEffect(() => {
    if (!productId) {
      setDetail(null);
      return;
    }
    productApi.getOne(productId).then((p) => {
      setDetail(p);
      setVariationId('');
      setPackageId('');
      setUnitId('');
      setModifierIds([]);
    });
  }, [productId]);

  const variation = detail?.variations?.find((v) => v.uuid === variationId) ?? null;
  const packages: PackagePrice[] = [
    ...(detail?.packagePrices ?? []),
    ...(detail?.variationPackagePrices ?? []).filter((p) => !variationId || p.variationUuid === variationId),
  ];
  const pkg = packages.find((p) => p.uuid === packageId) ?? null;
  const units: Unit[] = (detail?.unitAssignments ?? []).map((a) => a.unit).filter(Boolean);
  const unit = units.find((u) => u.uuid === unitId) ?? null;
  const modifiers: ProductModifier[] = [...(detail?.modifiers ?? []), ...(detail?.orgModifiers ?? [])];
  const chosenMods = modifiers.filter((m) => modifierIds.includes(m.uuid));
  const priced = detail
    ? priceCatalogSelection({ product: detail, variation, packagePrice: pkg, unit, modifiers: chosenMods })
    : { unitPrice: 0, unitsPerPackage: 1, factor: 1, modifierTotal: 0 };

  const taxRate = Number((detail as any)?.tax?.rate ?? 0);
  const productOptions: Option[] = products.map((p) => ({ label: p.name, value: p.uuid }));

  const persist = (updated: TableRow[]) => {
    setRows(updated);
    context?.setData((prev: any) => ({ ...prev, table: updated }));
  };

  const add = () => {
    const nextErrors: typeof errors = {};
    if (!detail) nextErrors.product = 'Please select a product';
    if (qty <= 0) nextErrors.quantity = 'Quantity must be greater than 0';
    if (detail?.hasVariations && (detail.variations?.length ?? 0) > 0 && !variationId) {
      nextErrors.product = 'Choose a variation';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !detail) return;

    const key = lineKey({
      productId: detail.uuid,
      variationId,
      packagePriceId: packageId,
      unitId,
      modifierIds,
    });
    const existing = rows.findIndex((r) => r.lineKey === key);
    let updated = [...rows];
    if (existing >= 0) {
      updated[existing] = { ...updated[existing], qty: updated[existing].qty + qty };
    } else {
      updated = [
        ...updated,
        {
          id: rows.length + 1,
          uuid: detail.uuid,
          productId: detail.productId,
          name: [detail.name, variation?.name, pkg?.packageName].filter(Boolean).join(' · '),
          qty,
          price: priced.unitPrice,
          tax: taxRate,
          variationId: variationId || null,
          packagePriceId: packageId || null,
          unitId: unitId || null,
          modifierIds,
          lineKey: key,
        },
      ];
    }
    persist(updated);
    setProductId('');
    setQty(1);
  };

  const subtotal = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const taxAmount = rows.reduce((s, r) => s + (r.qty * r.price * r.tax) / 100, 0);
  const money = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <SearchSelect
            options={productOptions}
            value={productOptions.find((o) => o.value === productId) ?? null}
            onChange={(opt) => setProductId(String(opt?.value ?? ''))}
            placeholder={isLoading ? 'Loading…' : 'Select product'}
          />
          {errors.product && <small className="text-red-500">{errors.product}</small>}
        </div>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className={`${FIELD_INPUT} w-24`}
        />
      </div>
      {detail?.variations && detail.variations.length > 0 && (
        <select className={FIELD_SELECT} value={variationId} onChange={(e) => setVariationId(e.target.value)}>
          <option value="">Variation</option>
          {detail.variations.map((v) => (
            <option key={v.uuid} value={v.uuid}>
              {v.name || v.sku || v.uuid}
            </option>
          ))}
        </select>
      )}
      {packages.length > 0 && (
        <select className={FIELD_SELECT} value={packageId} onChange={(e) => setPackageId(e.target.value)}>
          <option value="">Package (optional)</option>
          {packages.map((p) => (
            <option key={p.uuid} value={p.uuid}>
              {p.packageName} · {p.unitsPerPackage} × {p.packagePrice}
            </option>
          ))}
        </select>
      )}
      {units.length > 0 && (
        <select className={FIELD_SELECT} value={unitId} onChange={(e) => setUnitId(e.target.value)}>
          <option value="">Unit (optional)</option>
          {units.map((u) => (
            <option key={u.uuid} value={u.uuid}>
              {u.name} ({u.symbol})
            </option>
          ))}
        </select>
      )}
      {modifiers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {modifiers.map((m) => (
            <label key={m.uuid} className="flex items-center gap-2 text-sm">
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
        </div>
      )}
      <button type="button" onClick={add} className="inline-flex h-9 items-center rounded-[2px] bg-primary px-4 text-sm font-medium text-white">
        Add line · {currencySymbol} {money(priced.unitPrice)}
      </button>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2">Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.lineKey} className="border-b">
              <td className="py-2">{row.name}</td>
              <td>{row.qty}</td>
              <td>
                {currencySymbol} {money(row.qty * row.price)}
              </td>
              <td>
                <button type="button" onClick={() => persist(rows.filter((r) => r.lineKey !== row.lineKey))}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-muted-foreground">
        Subtotal {currencySymbol} {money(subtotal)} · Tax {currencySymbol} {money(taxAmount)} · Total {currencySymbol}{' '}
        {money(subtotal + taxAmount)}
      </p>
    </div>
  );
}

export const catalogLinePayload = (row: TableRow) => ({
  productId: row.uuid,
  variationId: row.variationId || undefined,
  packagePriceId: row.packagePriceId || undefined,
  unitId: row.unitId || undefined,
  modifierIds: row.modifierIds,
  quantity: row.qty,
  unitPrice: row.price,
  description: row.name,
});
