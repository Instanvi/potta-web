'use client';
import { useContext, useEffect, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { ContextData } from '@potta/components/providers/DataProvider';
import type { Option } from '@potta/components/search-select';
import useGetAllProducts from '@potta/app/(routes)/pos/inventory/_hooks/useGetAllProducts';
import { productApi } from '@potta/app/(routes)/pos/inventory/_utils/api';
import type { PackagePrice, Product, ProductModifier, Unit } from '@potta/app/(routes)/pos/inventory/_utils/types';
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
  isCustom?: boolean;
};

const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '40px',
    borderRadius: '2px',
    borderColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)',
    boxShadow: 'none',
    backgroundColor: '#fafafa',
    '&:hover': { borderColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)' },
  }),
  menu: (provided: any) => ({ ...provided, borderRadius: '2px', zIndex: 30 }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#0b5d1e' : state.isFocused ? '#f1faf7' : undefined,
    color: state.isSelected ? 'white' : '#111111',
    fontSize: '0.875rem',
  }),
};

export default function ProductLinesTable() {
  const context = useContext(ContextData);
  const [rows, setRows] = useState<TableRow[]>(context?.data?.table || []);
  const [productId, setProductId] = useState('');
  const [customName, setCustomName] = useState('');
  const [detail, setDetail] = useState<Product | null>(null);
  const [variationId, setVariationId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [modifierIds, setModifierIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [errors, setErrors] = useState<{ product?: string; quantity?: string }>({});

  const currency = context?.data?.currency || 'XAF';
  const currencySymbol = getCurrencySymbol(currency);
  const { data: productsData, isLoading } = useGetAllProducts({ page: 1, limit: 100 });
  const products: Product[] = productsData?.data || [];
  const isCustom = Boolean(customName) && !productId;

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

  useEffect(() => {
    if (detail) setUnitPrice(priced.unitPrice);
  }, [detail, priced.unitPrice]);

  const taxRate = Number((detail as any)?.tax?.rate ?? 0);
  const productOptions: Option[] = useMemo(
    () => products.map((p) => ({ label: p.name, value: p.uuid })),
    [products]
  );

  const selectedOption: Option | null = productId
    ? productOptions.find((o) => o.value === productId) ?? { label: customName || 'Selected', value: productId }
    : customName
      ? { label: customName, value: `custom:${customName}` }
      : null;

  const persist = (updated: TableRow[]) => {
    setRows(updated);
    context?.setData((prev: any) => ({ ...prev, table: updated }));
  };

  const resetComposer = () => {
    setProductId('');
    setCustomName('');
    setQty(1);
    setUnitPrice(0);
    setDetail(null);
  };

  const add = () => {
    const nextErrors: typeof errors = {};
    if (!detail && !customName.trim()) nextErrors.product = 'Select a product or type a service name';
    if (qty <= 0) nextErrors.quantity = 'Quantity must be greater than 0';
    if (detail?.hasVariations && (detail.variations?.length ?? 0) > 0 && !variationId) {
      nextErrors.product = 'Choose a variation';
    }
    if (isCustom && unitPrice < 0) nextErrors.product = 'Enter a price for this line';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (isCustom || !detail) {
      const name = customName.trim();
      const key = `custom-${name}-${unitPrice}`;
      const existing = rows.findIndex((r) => r.lineKey === key);
      let updated = [...rows];
      if (existing >= 0) {
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + qty };
      } else {
        updated = [
          ...updated,
          {
            id: rows.length + 1,
            uuid: `custom-${Date.now()}`,
            productId: '',
            name,
            qty,
            price: Number(unitPrice) || 0,
            tax: 0,
            lineKey: key,
            isCustom: true,
          },
        ];
      }
      persist(updated);
      resetComposer();
      return;
    }

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
    resetComposer();
  };

  const subtotal = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const taxAmount = rows.reduce((s, r) => s + (r.qty * r.price * r.tax) / 100, 0);
  const money = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const displayPrice = isCustom || !detail ? unitPrice : priced.unitPrice;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
        <div>
          <CreatableSelect<Option, false>
            styles={selectStyles}
            options={productOptions}
            value={selectedOption}
            isClearable
            isDisabled={isLoading}
            placeholder={isLoading ? 'Loading…' : 'Select or type a product / service'}
            formatCreateLabel={(input) => `Use “${input}” as a free-text line`}
            noOptionsMessage={({ inputValue }) =>
              inputValue
                ? `No products match — press Enter to use “${inputValue}”`
                : 'No products found — type a service name'
            }
            onChange={(opt) => {
              if (!opt) {
                setProductId('');
                setCustomName('');
                setUnitPrice(0);
                return;
              }
              const value = String(opt.value);
              if (value.startsWith('custom:') || !products.some((p) => p.uuid === value)) {
                setProductId('');
                setCustomName(opt.label);
                setDetail(null);
              } else {
                setCustomName('');
                setProductId(value);
              }
            }}
            onCreateOption={(input) => {
              setProductId('');
              setCustomName(input.trim());
              setDetail(null);
            }}
          />
          {errors.product && <small className="text-red-500">{errors.product}</small>}
        </div>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className={`${FIELD_INPUT} w-24`}
          aria-label="Quantity"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          value={displayPrice}
          onChange={(e) => setUnitPrice(Number(e.target.value))}
          className={`${FIELD_INPUT} w-32`}
          aria-label="Unit price"
          title={detail && !isCustom ? 'Catalog price (editable)' : 'Unit price'}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 items-center justify-center rounded-[2px] bg-primary px-4 text-sm text-white hover:bg-brand-hover"
        >
          Add line · {currencySymbol} {money(Number(displayPrice) || 0)}
        </button>
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
  productId: row.isCustom ? undefined : row.uuid,
  variationId: row.variationId || undefined,
  packagePriceId: row.packagePriceId || undefined,
  unitId: row.unitId || undefined,
  modifierIds: row.modifierIds,
  quantity: row.qty,
  unitPrice: row.price,
  description: row.name,
});
