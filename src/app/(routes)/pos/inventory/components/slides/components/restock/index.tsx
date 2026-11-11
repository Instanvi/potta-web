import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Button from '@potta/components/button';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import { apiErrorMessage } from '@potta/app/(routes)/pos/utils/sale';
import { Product } from '../../../../_utils/types';
import { useInventory } from '../../../../_utils/context';
import useGetAllProducts from '../../../../_hooks/useGetAllProducts';
import useRestockProduct from '../../../../_hooks/useRestockProduct';
import { FieldHint } from '../../../fields/ItemFormFields';

interface RestockModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const inputClass =
  'mt-2 h-[42px] w-full rounded-[2px] border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-ring/30';

/** Records stock received: quantity plus the unit cost paid, which updates the weighted average cost. */
const RestockModal: React.FC<RestockModalProps> = ({ open, setOpen }) => {
  const { selectedProduct: tableSelection } = useInventory();
  const { data: products } = useGetAllProducts({ limit: 100, page: 1 });
  const restock = useRestockProduct();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');

  useEffect(() => {
    if (!open) return;
    setProduct(tableSelection ?? null);
    setQuantity('');
    setUnitCost(tableSelection ? String(Number(tableSelection.cost ?? 0)) : '');
  }, [open, tableSelection]);

  const stocked = (products?.data ?? []).filter((p) => p.type !== 'NON_INVENTORY');
  const qty = Number(quantity);
  const cost = Number(unitCost);
  const qtyValid = Number.isInteger(qty) && qty >= 1;
  const costValid = unitCost === '' || (Number.isFinite(cost) && cost >= 0);
  const current = Number(product?.inventoryLevel ?? 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return toast.error('Choose the item you received');
    if (!qtyValid) return toast.error('Quantity must be a whole number of at least 1');
    if (!costValid) return toast.error('Unit cost must be 0 or more');
    try {
      await restock.mutateAsync({
        productId: product.uuid,
        quantity: qty,
        ...(unitCost !== '' ? { cost } : {}),
      });
      toast.success(`${qty} × ${product.name} added to stock`);
      setOpen(false);
    } catch (error) {
      toast.error(`Could not restock: ${apiErrorMessage(error)}`);
    }
  };

  return (
    <Slider open={open} setOpen={setOpen} edit title="Restock item">
      <form onSubmit={submit} className="flex min-h-full w-full max-w-3xl flex-col">
        <div className="flex-1 space-y-4 p-6 pb-24">
          <section className="space-y-4 rounded-[2px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div>
              <SearchableSelect
                label="Item received"
                options={stocked.map((p) => ({ value: p.uuid, label: p.sku ? `${p.name} (${p.sku})` : p.name }))}
                selectedValue={product?.uuid ?? ''}
                onChange={(value: string) => {
                  const next = stocked.find((p) => p.uuid === value) ?? null;
                  setProduct(next);
                  setUnitCost(next ? String(Number(next.cost ?? 0)) : '');
                }}
              />
              <FieldHint>Only stocked (inventory) items can be restocked.</FieldHint>
            </div>

            {product && (
              <>
                <div className="grid grid-cols-3 gap-3 rounded-[2px] bg-brand-subtle/50 p-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">On hand</p>
                    <p className="font-medium tabular-nums">{current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current unit cost</p>
                    <p className="font-medium tabular-nums">{Number(product.cost ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">After restock</p>
                    <p className="font-medium tabular-nums">{qtyValid ? current + qty : '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">
                      Quantity received<span className="text-red-500">*</span>
                    </span>
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="e.g. 24"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    {quantity !== '' && !qtyValid && (
                      <small className="text-red-500">Whole number of at least 1</small>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Unit cost paid</span>
                    <input
                      className={inputClass}
                      type="number"
                      min={0}
                      placeholder="Cost per unit"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                    />
                    <FieldHint>Updates the item&apos;s average cost.</FieldHint>
                  </label>
                </div>

                {qtyValid && costValid && unitCost !== '' && (
                  <p className="text-sm text-muted-foreground">
                    Stock value received: <span className="font-medium text-foreground">{(qty * cost).toLocaleString()}</span>
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <Button text="Cancel" type="button" theme="outline" onClick={() => setOpen(false)} />
          <Button text="Add to stock" type="submit" isLoading={restock.isPending} disabled={!product || !qtyValid} />
        </div>
      </form>
    </Slider>
  );
};

export default RestockModal;
