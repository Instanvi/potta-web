'use client';
import { Plus, Trash } from '@phosphor-icons/react';
import { FIELD_INPUT } from '@/lib/field-styles';
import { FormSection } from './fields/ItemFormFields';

export type CatalogDraft = {
  attributes: { name: string; options: string }[];
  extraUnits: { name: string; symbol: string; factor: string }[];
  packages: { packageName: string; unitsPerPackage: string; packagePrice: string }[];
  modifiers: { name: string; price: string }[];
};

export const emptyCatalogDraft = (): CatalogDraft => ({
  attributes: [],
  extraUnits: [],
  packages: [],
  modifiers: [],
});

export function catalogDraftFromProduct(product: any): CatalogDraft {
  const attrs = new Map<string, Set<string>>();
  for (const variation of product?.variations ?? []) {
    Object.entries(variation.attributes ?? {}).forEach(([name, value]) => {
      if (!name || value == null || String(value).trim() === '') return;
      if (!attrs.has(name)) attrs.set(name, new Set());
      attrs.get(name)!.add(String(value));
    });
    for (const option of variation.options ?? []) {
      const name = option.label?.name;
      const value = option.value;
      if (!name || !value) continue;
      if (!attrs.has(name)) attrs.set(name, new Set());
      attrs.get(name)!.add(value);
    }
  }
  return {
    attributes: [...attrs.entries()].map(([name, options]) => ({ name, options: [...options].join(', ') })),
    extraUnits: (product?.unitAssignments ?? []).map((a: any) => ({
      name: a.unit?.name ?? '',
      symbol: a.unit?.symbol ?? '',
      factor: String(a.unit?.factor ?? 1),
    })),
    packages: (product?.packagePrices ?? []).map((p: any) => ({
      packageName: p.packageName ?? '',
      unitsPerPackage: String(p.unitsPerPackage ?? 1),
      packagePrice: String(p.packagePrice ?? 0),
    })),
    modifiers: (product?.modifiers ?? []).map((m: any) => ({
      name: m.name ?? '',
      price: String(m.price ?? 0),
    })),
  };
}

export function catalogDraftToPayload(draft: CatalogDraft) {
  const attributes = draft.attributes
    .map((a) => ({
      name: a.name.trim(),
      options: a.options.split(',').map((o) => o.trim()).filter(Boolean),
    }))
    .filter((a) => a.name && a.options.length);
  const variations = cartesianVariations(attributes);
  return {
    attributes,
    variations,
    units: draft.extraUnits
      .filter((u) => u.name.trim())
      .map((u) => ({
        name: u.name.trim(),
        symbol: u.symbol.trim() || u.name.trim(),
        factor: Number(u.factor) || 1,
      })),
    packagePrices: draft.packages
      .filter((p) => p.packageName.trim())
      .map((p) => ({
        packageName: p.packageName.trim(),
        unitsPerPackage: Number(p.unitsPerPackage) || 1,
        packagePrice: Number(p.packagePrice) || 0,
      })),
    modifiers: draft.modifiers
      .filter((m) => m.name.trim())
      .map((m) => ({ name: m.name.trim(), price: Number(m.price) || 0 })),
  };
}

export function cartesianVariations(attributes: { name: string; options: string[] }[]) {
  if (!attributes.length) return [];
  return attributes.reduce<{ name: string; attributes: Record<string, string> }[]>((rows, attr) => {
    if (!rows.length) {
      return attr.options.map((option) => ({ name: option, attributes: { [attr.name]: option } }));
    }
    return rows.flatMap((row) =>
      attr.options.map((option) => ({
        name: `${row.name} / ${option}`,
        attributes: { ...row.attributes, [attr.name]: option },
      })),
    );
  }, []);
}

const input = FIELD_INPUT;

const AddRow = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button type="button" onClick={onClick} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
    <Plus size={12} /> {children}
  </button>
);

/** Attributes, extra units, packages and modifiers — created with the item, not only synced from Pay. */
export default function CatalogPeripheralsEditor({
  value,
  onChange,
}: {
  value: CatalogDraft;
  onChange: (next: CatalogDraft) => void;
}) {
  const set = (patch: Partial<CatalogDraft>) => onChange({ ...value, ...patch });
  const previews = cartesianVariations(
    value.attributes
      .map((a) => ({ name: a.name.trim(), options: a.options.split(',').map((o) => o.trim()).filter(Boolean) }))
      .filter((a) => a.name && a.options.length),
  );

  return (
    <>
      <FormSection
        title="Variations"
        description="Optional. Add attributes such as Size or Color; each combination becomes a sellable variation."
      >
        <div className="md:col-span-2 space-y-2">
          {value.attributes.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={input}
                placeholder="Attribute (e.g. Size)"
                value={row.name}
                onChange={(e) => {
                  const attributes = [...value.attributes];
                  attributes[index] = { ...row, name: e.target.value };
                  set({ attributes });
                }}
              />
              <input
                className={input}
                placeholder="Options, comma separated (S, M, L)"
                value={row.options}
                onChange={(e) => {
                  const attributes = [...value.attributes];
                  attributes[index] = { ...row, options: e.target.value };
                  set({ attributes });
                }}
              />
              <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => set({ attributes: value.attributes.filter((_, i) => i !== index) })}>
                <Trash size={16} />
              </button>
            </div>
          ))}
          <AddRow onClick={() => set({ attributes: [...value.attributes, { name: '', options: '' }] })}>Add attribute</AddRow>
          {previews.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {previews.length} variation{previews.length === 1 ? '' : 's'}: {previews.map((v) => v.name).join(', ')}
            </p>
          )}
        </div>
      </FormSection>

      <FormSection title="Extra units and packages" description="Optional. Sell this item in another unit or as a pack.">
        <div className="md:col-span-2 space-y-3">
          {value.extraUnits.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_6rem_auto] gap-2">
              <input className={input} placeholder="Unit name (Carton)" value={row.name} onChange={(e) => {
                const extraUnits = [...value.extraUnits];
                extraUnits[index] = { ...row, name: e.target.value };
                set({ extraUnits });
              }} />
              <input className={input} placeholder="Symbol (ctn)" value={row.symbol} onChange={(e) => {
                const extraUnits = [...value.extraUnits];
                extraUnits[index] = { ...row, symbol: e.target.value };
                set({ extraUnits });
              }} />
              <input className={input} type="number" min={0} step="any" placeholder="Factor" value={row.factor} onChange={(e) => {
                const extraUnits = [...value.extraUnits];
                extraUnits[index] = { ...row, factor: e.target.value };
                set({ extraUnits });
              }} />
              <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => set({ extraUnits: value.extraUnits.filter((_, i) => i !== index) })}>
                <Trash size={16} />
              </button>
            </div>
          ))}
          <AddRow onClick={() => set({ extraUnits: [...value.extraUnits, { name: '', symbol: '', factor: '1' }] })}>Add unit</AddRow>

          {value.packages.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_7rem_7rem_auto] gap-2">
              <input className={input} placeholder="Package (e.g. Pack of 6)" value={row.packageName} onChange={(e) => {
                const packages = [...value.packages];
                packages[index] = { ...row, packageName: e.target.value };
                set({ packages });
              }} />
              <input className={input} type="number" min={1} placeholder="Qty" value={row.unitsPerPackage} onChange={(e) => {
                const packages = [...value.packages];
                packages[index] = { ...row, unitsPerPackage: e.target.value };
                set({ packages });
              }} />
              <input className={input} type="number" min={0} step="any" placeholder="Price" value={row.packagePrice} onChange={(e) => {
                const packages = [...value.packages];
                packages[index] = { ...row, packagePrice: e.target.value };
                set({ packages });
              }} />
              <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => set({ packages: value.packages.filter((_, i) => i !== index) })}>
                <Trash size={16} />
              </button>
            </div>
          ))}
          <AddRow onClick={() => set({ packages: [...value.packages, { packageName: '', unitsPerPackage: '1', packagePrice: '' }] })}>Add package</AddRow>
        </div>
      </FormSection>

      <FormSection title="Modifiers" description="Optional extras charged on top of the item (gift wrap, extra shot).">
        <div className="md:col-span-2 space-y-2">
          {value.modifiers.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_8rem_auto] gap-2">
              <input className={input} placeholder="Modifier name" value={row.name} onChange={(e) => {
                const modifiers = [...value.modifiers];
                modifiers[index] = { ...row, name: e.target.value };
                set({ modifiers });
              }} />
              <input className={input} type="number" min={0} step="any" placeholder="Price" value={row.price} onChange={(e) => {
                const modifiers = [...value.modifiers];
                modifiers[index] = { ...row, price: e.target.value };
                set({ modifiers });
              }} />
              <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => set({ modifiers: value.modifiers.filter((_, i) => i !== index) })}>
                <Trash size={16} />
              </button>
            </div>
          ))}
          <AddRow onClick={() => set({ modifiers: [...value.modifiers, { name: '', price: '' }] })}>Add modifier</AddRow>
        </div>
      </FormSection>
    </>
  );
}
