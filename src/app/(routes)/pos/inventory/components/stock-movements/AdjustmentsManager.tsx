import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import Button from '@potta/components/button';
import Select from '@potta/components/select';
import Slider from '@potta/components/slideover';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ListToolbar } from '../../../../_shared/states';
import { apiErrorMessage, formatAmount, formatDate } from '../../../../_shared/format';
import type { Product } from '../../_utils/types';
import {
  ADJUSTMENT_TYPE_OPTIONS,
  labelOf,
  type AdjustmentType,
  type ProductAdjustment,
} from '../../_utils/stockMovementsApi';
import {
  useApplyAdjustment,
  useCreateAdjustment,
  useProductAdjustments,
  useRejectAdjustment,
} from '../../_hooks/useStockMovements';
import { FieldHint } from '../fields/ItemFormFields';
import {
  ConfirmDialog,
  ItemCell,
  MovementFilters,
  MovementStatus,
  RowActions,
  StockFacts,
  StockItemPicker,
  inputClass,
  panelClass,
} from './shared';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Applied' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const REMOVING_TYPES: AdjustmentType[] = ['PHYSICAL_DAMAGE', 'EXPIRATION', 'QUALITY_ADJUSTMENT'];

const NewAdjustmentSheet = ({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) => {
  const create = useCreateAdjustment();
  const apply = useApplyAdjustment();
  const [product, setProduct] = useState<Product | null>(null);
  const [type, setType] = useState<AdjustmentType>('INVENTORY_COUNT');
  const [counted, setCounted] = useState('');
  const [direction, setDirection] = useState<'remove' | 'add'>('remove');
  const [quantity, setQuantity] = useState('');
  const [newCost, setNewCost] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [applyNow, setApplyNow] = useState(true);


  const onHand = Number(product?.inventoryLevel ?? 0);
  const isCount = type === 'INVENTORY_COUNT';
  const isCost = type === 'COST_ADJUSTMENT';

  const countedN = Number(counted);
  const qtyN = Number(quantity);
  const costN = Number(newCost);
  const countValid = counted !== '' && Number.isInteger(countedN) && countedN >= 0;
  const qtyValid = quantity !== '' && Number.isInteger(qtyN) && qtyN >= 1;
  const costValid = newCost !== '' && Number.isFinite(costN) && costN >= 0;

  const delta = isCost ? 0 : isCount ? (countValid ? countedN - onHand : NaN) : qtyValid ? (direction === 'add' ? qtyN : -qtyN) : NaN;
  const after = Number.isFinite(delta) ? onHand + delta : NaN;

  const problem = !product
    ? 'Choose an item'
    : isCost
    ? !costValid
      ? 'Enter the new unit cost'
      : null
    : !Number.isFinite(delta)
    ? isCount
      ? 'Enter the counted quantity (whole number)'
      : 'Enter a whole quantity of at least 1'
    : delta === 0
    ? 'The count matches the stock on hand; nothing to adjust'
    : after < 0
    ? `Only ${onHand} on hand; you cannot remove more`
    : !reason.trim()
    ? 'Give a reason'
    : null;
  const reasonMissing = isCost && !reason.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problem || reasonMissing) return toast.error(problem ?? 'Give a reason');
    try {
      const created = await create.mutateAsync({
        productId: product!.uuid,
        adjustmentType: type,
        quantityAdjustment: delta,
        ...(isCost ? { costAdjustment: costN } : {}),
        reason: reason.trim(),
        ...(reference.trim() ? { referenceDocument: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      if (applyNow) await apply.mutateAsync(created.uuid);
      toast.success(applyNow ? 'Adjustment applied' : 'Adjustment saved as pending');
      setOpen(false);
    } catch (error) {
      toast.error(`Could not save the adjustment: ${apiErrorMessage(error, 'unknown error')}`);
    }
  };

  return (
    <Slider open={open} setOpen={setOpen} edit title="New stock adjustment">
      <form onSubmit={submit} className="flex min-h-full w-full max-w-3xl flex-col">
        <div className="flex-1 space-y-4 p-6 pb-24">
          <section className={panelClass}>
            <StockItemPicker
              label="Item"
              product={product}
              onChange={(p) => {
                setProduct(p);
                if (p && isCost) setNewCost(String(Number(p.cost ?? 0)));
              }}
            />
            <Select
              label="Adjustment type"
              required
              bg="bg-white"
              options={ADJUSTMENT_TYPE_OPTIONS}
              selectedValue={type}
              onChange={(v: AdjustmentType) => {
                setType(v);
                setDirection(REMOVING_TYPES.includes(v) ? 'remove' : direction);
                if (v === 'COST_ADJUSTMENT' && product) setNewCost(String(Number(product.cost ?? 0)));
              }}
            />
            {product && (
              <StockFacts
                facts={
                  isCost
                    ? [
                        { label: 'On hand', value: onHand },
                        { label: 'Current unit cost', value: formatAmount(product.cost) },
                        { label: 'New unit cost', value: costValid ? formatAmount(costN) : '—' },
                      ]
                    : [
                        { label: 'On hand', value: onHand },
                        {
                          label: 'Change',
                          value: Number.isFinite(delta) ? (delta > 0 ? `+${delta}` : delta) : '—',
                        },
                        { label: 'After adjustment', value: Number.isFinite(after) ? after : '—' },
                      ]
                }
              />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {isCount && (
                <label className="block">
                  <span className="text-sm font-medium">
                    Counted quantity<span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="What is physically on the shelf"
                    value={counted}
                    onChange={(e) => setCounted(e.target.value)}
                  />
                  <FieldHint>The difference with the stock on hand is recorded.</FieldHint>
                </label>
              )}
              {!isCount && !isCost && (
                <>
                  <Select
                    label="Direction"
                    bg="bg-white"
                    options={[
                      { value: 'remove', label: 'Remove from stock' },
                      { value: 'add', label: 'Add to stock' },
                    ]}
                    selectedValue={direction}
                    onChange={(v: 'remove' | 'add') => setDirection(v)}
                  />
                  <label className="block">
                    <span className="text-sm font-medium">
                      Quantity<span className="text-red-500">*</span>
                    </span>
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="e.g. 3"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </label>
                </>
              )}
              {isCost && (
                <label className="block">
                  <span className="text-sm font-medium">
                    New unit cost<span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    placeholder="Cost per unit"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                  />
                  <FieldHint>Replaces the item&apos;s average cost; stock quantity is unchanged.</FieldHint>
                </label>
              )}
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">
                  Reason<span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  placeholder={isCount ? 'e.g. Monthly stock take' : 'e.g. Broken during handling'}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Reference document</span>
                <input
                  className={inputClass}
                  placeholder="e.g. count sheet number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  className={`${inputClass} h-24 py-2`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className={panelClass}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" checked={applyNow} onChange={(e) => setApplyNow(e.target.checked)} />
              <span>
                <span className="block text-sm font-medium">Apply now</span>
                <FieldHint>Untick to keep the adjustment pending until someone approves it.</FieldHint>
              </span>
            </label>
          </section>
          {product && (problem || reasonMissing) && (
            <p className="text-sm text-muted-foreground">{problem ?? 'Give a reason'}</p>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <Button text="Cancel" type="button" theme="outline" onClick={() => setOpen(false)} />
          <Button
            text={applyNow ? 'Apply adjustment' : 'Save as pending'}
            type="submit"
            isLoading={create.isPending || apply.isPending}
            disabled={!!problem || reasonMissing}
          />
        </div>
      </form>
    </Slider>
  );
};

const AdjustmentsManager = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const openSheet = () => {
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  };
  const [pendingAction, setPendingAction] = useState<{ kind: 'apply' | 'reject'; row: ProductAdjustment } | null>(
    null
  );
  const debounced = useDebouncedValue(search.trim());
  const { page, limit, tableProps } = useServerPagination({ pageSize: 20, resetOn: [debounced, status, type] });
  const { data, isLoading } = useProductAdjustments({ page, limit, status, type, search: debounced });
  const applyAdjustment = useApplyAdjustment();
  const rejectAdjustment = useRejectAdjustment();

  const confirm = async () => {
    if (!pendingAction) return;
    const { kind, row } = pendingAction;
    try {
      if (kind === 'apply') await applyAdjustment.mutateAsync(row.uuid);
      else await rejectAdjustment.mutateAsync(row.uuid);
      toast.success(kind === 'apply' ? 'Adjustment applied' : 'Adjustment rejected');
      setPendingAction(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Action failed'));
    }
  };

  const columns: ColumnDef<ProductAdjustment>[] = [
    { id: 'date', header: 'Date', cell: ({ row }) => formatDate(row.original.createdAt) },
    { id: 'item', header: 'Item', cell: ({ row }) => <ItemCell product={row.original.product} /> },
    { id: 'type', header: 'Type', cell: ({ row }) => labelOf(ADJUSTMENT_TYPE_OPTIONS, row.original.adjustmentType) },
    {
      id: 'change',
      header: 'Change',
      cell: ({ row }) => {
        const { quantityAdjustment: q, costAdjustment: c } = row.original;
        if (q) {
          return (
            <span className={`tabular-nums ${q > 0 ? 'text-success' : 'text-destructive'}`}>
              {q > 0 ? `+${q}` : q}
            </span>
          );
        }
        return c != null ? <span className="tabular-nums">Cost → {formatAmount(c)}</span> : '—';
      },
    },
    { id: 'reason', header: 'Reason', cell: ({ row }) => row.original.reason },
    { id: 'status', header: 'Status', cell: ({ row }) => <MovementStatus status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          pending={row.original.status === 'PENDING'}
          primaryLabel="Apply"
          onPrimary={() => setPendingAction({ kind: 'apply', row: row.original })}
          onReject={() => setPendingAction({ kind: 'reject', row: row.original })}
        />
      ),
    },
  ];

  const target = pendingAction?.row;
  return (
    <div className="w-full">
      <ListToolbar actions={<Button text="New adjustment" type="button" onClick={openSheet} />}>
        <MovementFilters
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          statusOptions={STATUS_OPTIONS}
          extra={
            <div className="w-44">
              <Select
                bg="bg-white"
                options={[{ value: '', label: 'All types' }, ...ADJUSTMENT_TYPE_OPTIONS]}
                selectedValue={type}
                onChange={setType}
                placeholder="All types"
              />
            </div>
          }
        />
      </ListToolbar>
      <DataGrid
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        {...tableProps(data?.meta, data?.data?.length)}
      />
      <NewAdjustmentSheet key={sheetKey} open={sheetOpen} setOpen={setSheetOpen} />
      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.kind === 'apply' ? 'Apply this adjustment?' : 'Reject this adjustment?'}
        description={
          target &&
          (pendingAction?.kind === 'apply'
            ? target.quantityAdjustment
              ? `Stock of ${target.product?.name ?? 'the item'} changes by ${
                  target.quantityAdjustment > 0 ? '+' : ''
                }${target.quantityAdjustment}.`
              : `The unit cost of ${target.product?.name ?? 'the item'} becomes ${formatAmount(target.costAdjustment)}.`
            : 'The adjustment will be closed and stock will not change.')
        }
        confirmText={pendingAction?.kind === 'apply' ? 'Apply' : 'Reject'}
        danger={pendingAction?.kind === 'reject'}
        loading={applyAdjustment.isPending || rejectAdjustment.isPending}
        onConfirm={confirm}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
};

export default AdjustmentsManager;
