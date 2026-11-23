'use client';

import { useState } from 'react';
import { CaretDown, Package, Plus, Trash } from '@phosphor-icons/react';
import { Button } from '@potta/components/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@potta/components/shadcn/command';
import { Input } from '@potta/components/shadcn/input';
import { Label } from '@potta/components/shadcn/label';
import { Popover, PopoverContent, PopoverTrigger } from '@potta/components/shadcn/popover';
import useGetAllProducts from '@potta/app/(routes)/pos/inventory/_hooks/useGetAllProducts';
import { productApi } from '@potta/app/(routes)/pos/inventory/_utils/api';
import type { Product } from '@potta/app/(routes)/pos/inventory/_utils/types';
import { priceCatalogSelection } from '@/lib/catalog-price';
import { cn } from '@potta/lib/utils';

export type DocumentLine = {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount?: number;
  orderedQuantity?: number;
  variationId?: string;
  packagePriceId?: string;
  unitId?: string;
};

export const DEFAULT_LINE_TAX_RATE = 19.25;

export const emptyDocumentLine = (taxRate = DEFAULT_LINE_TAX_RATE): DocumentLine => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate,
  discountAmount: 0,
});

function lineAmount(line: DocumentLine) {
  const qty = Number(line.quantity) || 0;
  const price = Number(line.unitPrice) || 0;
  const tax = Number(line.taxRate) || 0;
  const discount = Number(line.discountAmount) || 0;
  const net = Math.max(0, qty * price - discount);
  return net + (net * tax) / 100;
}

function ProductCombobox({
  line,
  products,
  loading,
  onPickProduct,
  onPickCustom,
}: {
  line: DocumentLine;
  products: Product[];
  loading?: boolean;
  onPickProduct: (product: Product) => void;
  onPickCustom: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const label = line.description?.trim() || 'Select product / service';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={loading}
          className="h-10 w-full justify-start gap-2 rounded-[2px] px-3 font-normal"
        >
          <Package size={16} className="shrink-0 text-primary" weight="duotone" />
          <span className={cn('min-w-0 flex-1 truncate text-left', !line.description && 'text-muted-foreground')}>
            {loading ? 'Loading…' : label}
          </span>
          <CaretDown size={14} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput
            placeholder="Search catalog or type a service…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {query.trim() ? (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    onPickCustom(query.trim());
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  Use “{query.trim()}” as a free-text line
                </button>
              ) : (
                <span className="px-3 py-2 text-sm text-muted-foreground">No products found</span>
              )}
            </CommandEmpty>
            <CommandGroup heading="Products">
              {products.map((p) => (
                <CommandItem
                  key={p.uuid}
                  value={p.name}
                  onSelect={() => {
                    onPickProduct(p);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Package size={14} className="mr-2 text-muted-foreground" />
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {query.trim() && products.every((p) => p.name.toLowerCase() !== query.trim().toLowerCase()) ? (
              <CommandGroup>
                <CommandItem
                  value={`create-${query}`}
                  onSelect={() => {
                    onPickCustom(query.trim());
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Plus size={14} className="mr-2" />
                  Use “{query.trim()}”
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Shared shadcn line editor for invoice / bill / PO / sales-order sheets. */
export function DocumentLinesEditor({
  lines,
  onChange,
  confirmQuantities = false,
  defaultTaxRate = DEFAULT_LINE_TAX_RATE,
  className,
}: {
  lines: DocumentLine[];
  onChange: (next: DocumentLine[]) => void;
  confirmQuantities?: boolean;
  defaultTaxRate?: number;
  className?: string;
}) {
  const { data, isLoading } = useGetAllProducts({ page: 1, limit: 100 });
  const products: Product[] = data?.data ?? [];
  const rows = lines.length > 0 ? lines : [];

  const setLine = (index: number, patch: Partial<DocumentLine>) => {
    onChange(rows.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const pickProduct = async (index: number, product: Product) => {
    let detail: Product = product;
    try {
      detail = await productApi.getOne(product.uuid);
    } catch {
      /* use list row */
    }
    const priced = priceCatalogSelection({
      product: detail,
      variation: null,
      packagePrice: null,
      unit: null,
      modifiers: [],
    });
    const taxRate = Number(detail.tax?.rate ?? defaultTaxRate);
    setLine(index, {
      productId: detail.uuid,
      description: detail.name,
      unitPrice: priced.unitPrice,
      taxRate,
    });
  };

  const addLine = () => {
    onChange([...rows, emptyDocumentLine(defaultTaxRate)]);
  };

  const removeLine = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-[2px] border border-black/[0.08] bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No lines yet — click Add line below.
          </p>
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {rows.map((line, index) => (
              <li key={`line-${index}`} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-12 sm:items-end">
                <div className="space-y-1.5 sm:col-span-5">
                  <Label className="text-xs font-medium text-foreground">Product / service</Label>
                  <ProductCombobox
                    line={line}
                    products={products}
                    loading={isLoading}
                    onPickProduct={(p) => void pickProduct(index, p)}
                    onPickCustom={(name) =>
                      setLine(index, {
                        productId: undefined,
                        description: name,
                      })
                    }
                  />
                  <Input
                    value={line.description}
                    onChange={(e) => setLine(index, { description: e.target.value })}
                    placeholder="Description"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">
                    {confirmQuantities ? 'Received qty' : 'Qty'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={line.quantity}
                    onChange={(e) => setLine(index, { quantity: Number(e.target.value) || 0 })}
                  />
                  {confirmQuantities && line.orderedQuantity != null ? (
                    <span className="text-[11px] text-muted-foreground">
                      Ordered {line.orderedQuantity}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={line.unitPrice}
                    onChange={(e) => setLine(index, { unitPrice: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Tax %</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={line.taxRate}
                    onChange={(e) => setLine(index, { taxRate: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-end">
                  <span className="text-sm tabular-nums text-muted-foreground sm:mb-2">
                    {lineAmount(line).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeLine(index)}
                    aria-label="Remove line"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addLine}
        className="h-10 rounded-full border-primary/30 px-5 text-primary hover:bg-brand-subtle hover:text-primary"
      >
        <Plus size={16} weight="bold" />
        Add line
      </Button>
    </div>
  );
}
