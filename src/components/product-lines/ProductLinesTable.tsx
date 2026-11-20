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
import { FIELD_INPUT, FIELD_SELECT, SHEET_FIELD_LABEL } from '@/lib/field-styles';

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

/** Underline control to match FIELD_INPUT / books document forms. */
const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '40px',
    height: '40px',
    borderRadius: '2px 2px 0 0',
    borderWidth: 0,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)',
    boxShadow: 'none',
    backgroundColor: '#ffffff',
    '&:hover': {
      borderBottomColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)',
    },
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: '0 12px',
    height: '40px',
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    height: '40px',
  }),
  input: (provided: any) => ({ ...provided, margin: 0, padding: 0 }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'rgba(0,0,0,0.35)',
    fontSize: '0.875rem',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    fontSize: '0.875rem',
    color: '#111111',
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
  const linePreview = Number(displayPrice) * Number(qty || 0);

  return (
    <div className="space-y-5">
      {/* Composer: one labeled row — Product | Qty | Price | Add */}
      <div className="rounded-[2px] border border-black/[0.08] bg-white p-4">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <span className={SHEET_FIELD_LABEL}>Product / service</span>
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
            {errors.product && <p className="mt-1 text-sm text-red-500">{errors.product}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={SHEET_FIELD_LABEL} htmlFor="line-qty">
              Qty
            </label>
            <input
              id="line-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className={FIELD_INPUT}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={SHEET_FIELD_LABEL} htmlFor="line-price">
              Price
            </label>
            <input
              id="line-price"
              type="number"
              min={0}
              step="0.01"
              value={displayPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className={FIELD_INPUT}
              title={detail && !isCustom ? 'Catalog price (editable)' : 'Unit price'}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={add}
              className="inline-flex h-10 w-full items-center justify-center rounded-[2px] bg-primary px-3 text-sm text-white hover:bg-brand-hover"
            >
              Add line
            </button>
            <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
              {currencySymbol} {money(linePreview)}
            </p>
          </div>
        </div>

        {(detail?.variations?.length ||
          packages.length > 0 ||
          units.length > 0 ||
          modifiers.length > 0) && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-black/[0.06] pt-4 md:grid-cols-3">
            {detail?.variations && detail.variations.length > 0 && (
              <div>
                <span className={SHEET_FIELD_LABEL}>Variation</span>
                <select
                  className={FIELD_SELECT}
                  value={variationId}
                  onChange={(e) => setVariationId(e.target.value)}
                >
                  <option value="">Select variation</option>
                  {detail.variations.map((v) => (
                    <option key={v.uuid} value={v.uuid}>
                      {v.name || v.sku || v.uuid}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {packages.length > 0 && (
              <div>
                <span className={SHEET_FIELD_LABEL}>Package</span>
                <select
                  className={FIELD_SELECT}
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                >
                  <option value="">Optional</option>
                  {packages.map((p) => (
                    <option key={p.uuid} value={p.uuid}>
                      {p.packageName} · {p.unitsPerPackage} × {p.packagePrice}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {units.length > 0 && (
              <div>
                <span className={SHEET_FIELD_LABEL}>Unit</span>
                <select
                  className={FIELD_SELECT}
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                >
                  <option value="">Optional</option>
                  {units.map((u) => (
                    <option key={u.uuid} value={u.uuid}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {modifiers.length > 0 && (
              <div className="md:col-span-3">
                <span className={SHEET_FIELD_LABEL}>Modifiers</span>
                <div className="mt-1 flex flex-wrap gap-3">
                  {modifiers.map((m) => (
                    <label key={m.uuid} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={modifierIds.includes(m.uuid)}
                        onChange={(e) =>
                          setModifierIds((ids) =>
                            e.target.checked ? [...ids, m.uuid] : ids.filter((id) => id !== m.uuid),
                          )
                        }
                      />
                      {m.name} (+{m.price})
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Added lines */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.08] text-left text-muted-foreground">
              <th className="py-2 pr-3 font-normal">Item</th>
              <th className="w-20 py-2 pr-3 font-normal">Qty</th>
              <th className="w-28 py-2 pr-3 text-right font-normal">Amount</th>
              <th className="w-16 py-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                  No lines yet — select a product and click Add line.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.lineKey} className="border-b border-black/[0.06]">
                  <td className="py-2.5 pr-3 text-foreground">{row.name}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.qty}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {currencySymbol} {money(row.qty * row.price)}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-destructive"
                      onClick={() => persist(rows.filter((r) => r.lineKey !== row.lineKey))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums text-foreground">
            {currencySymbol} {money(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="tabular-nums text-foreground">
            {currencySymbol} {money(taxAmount)}
          </span>
        </div>
        <div className="flex justify-between border-t border-black/[0.08] pt-2 text-base font-medium text-foreground">
          <span>Total</span>
          <span className="tabular-nums">
            {currencySymbol} {money(subtotal + taxAmount)}
          </span>
        </div>
      </div>
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
