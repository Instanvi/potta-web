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
import { apiErrorMessage, formatDate } from '../../../../_shared/format';
import type { Product } from '../../_utils/types';
import {
  RETURN_REASON_OPTIONS,
  labelOf,
  type ProductReturn,
  type ReturnReason,
} from '../../_utils/stockMovementsApi';
import {
  useCreateReturn,
  useProcessReturn,
  useProductReturns,
  useRejectReturn,
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
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const NewReturnSheet = ({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) => {
  const create = useCreateReturn();
  const process = useProcessReturn();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<ReturnReason>('CUSTOMER_REQUEST');
  const [restock, setRestock] = useState(true);
  const [processNow, setProcessNow] = useState(true);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');


  const qty = Number(quantity);
  const qtyValid = Number.isInteger(qty) && qty >= 1;
  const onHand = Number(product?.inventoryLevel ?? 0);
  const busy = create.isPending || process.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return toast.error('Choose the returned item');
    if (!qtyValid) return toast.error('Quantity must be a whole number of at least 1');
    try {
      const created = await create.mutateAsync({
        productId: product.uuid,
        quantity: qty,
        reason,
        restockItems: restock,
        ...(reference.trim() ? { referenceTransaction: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      if (processNow) await process.mutateAsync(created.uuid);
      toast.success(processNow ? 'Return recorded and processed' : 'Return recorded as pending');
      setOpen(false);
    } catch (error) {
      toast.error(`Could not record the return: ${apiErrorMessage(error, 'unknown error')}`);
    }
  };

  return (
    <Slider open={open} setOpen={setOpen} edit title="New return">
      <form onSubmit={submit} className="flex min-h-full w-full max-w-3xl flex-col">
        <div className="flex-1 space-y-4 p-6 pb-24">
          <section className={panelClass}>
            <StockItemPicker label="Returned item" product={product} onChange={setProduct} />
            {product && (
              <StockFacts
                facts={[
                  { label: 'On hand', value: onHand },
                  { label: 'Returned', value: qtyValid ? qty : '—' },
                  { label: 'After processing', value: qtyValid ? (restock ? onHand + qty : onHand) : '—' },
                ]}
              />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">
                  Quantity returned<span className="text-red-500">*</span>
                </span>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 2"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {quantity !== '' && !qtyValid && <small className="text-red-500">Whole number of at least 1</small>}
              </label>
              <Select
                label="Reason"
                required
                bg="bg-white"
                options={RETURN_REASON_OPTIONS}
                selectedValue={reason}
                onChange={(v: ReturnReason) => setReason(v)}
              />
              <label className="block">
                <span className="text-sm font-medium">Sale or receipt reference</span>
                <input
                  className={inputClass}
                  placeholder="e.g. receipt number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  className={`${inputClass} h-24 py-2`}
                  placeholder="Condition of the item, who returned it…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className={panelClass}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
              <span>
                <span className="block text-sm font-medium">Put the items back in stock</span>
                <FieldHint>Leave unticked for damaged or expired goods that cannot be resold.</FieldHint>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={processNow}
                onChange={(e) => setProcessNow(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium">Process now</span>
                <FieldHint>Untick to keep the return pending until someone approves it.</FieldHint>
              </span>
            </label>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <Button text="Cancel" type="button" theme="outline" onClick={() => setOpen(false)} />
          <Button text="Record return" type="submit" isLoading={busy} disabled={!product || !qtyValid} />
        </div>
      </form>
    </Slider>
  );
};

const ReturnsManager = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const openSheet = () => {
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  };
  const [pendingAction, setPendingAction] = useState<{ kind: 'process' | 'reject'; row: ProductReturn } | null>(null);
  const debounced = useDebouncedValue(search.trim());
  const { page, limit, tableProps } = useServerPagination({ pageSize: 20, resetOn: [debounced, status] });
  const { data, isLoading } = useProductReturns({ page, limit, status, search: debounced });
  const processReturn = useProcessReturn();
  const rejectReturn = useRejectReturn();

  const confirm = async () => {
    if (!pendingAction) return;
    const { kind, row } = pendingAction;
    try {
      if (kind === 'process') await processReturn.mutateAsync(row.uuid);
      else await rejectReturn.mutateAsync(row.uuid);
      toast.success(kind === 'process' ? 'Return processed' : 'Return rejected');
      setPendingAction(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Action failed'));
    }
  };

  const columns: ColumnDef<ProductReturn>[] = [
    { id: 'date', header: 'Date', cell: ({ row }) => formatDate(row.original.createdAt) },
    { id: 'item', header: 'Item', cell: ({ row }) => <ItemCell product={row.original.product} /> },
    {
      id: 'quantity',
      header: 'Qty',
      cell: ({ row }) => <span className="tabular-nums">{row.original.quantity}</span>,
    },
    { id: 'reason', header: 'Reason', cell: ({ row }) => labelOf(RETURN_REASON_OPTIONS, row.original.reason) },
    { id: 'restock', header: 'Back to stock', cell: ({ row }) => (row.original.restockItems ? 'Yes' : 'No') },
    { id: 'reference', header: 'Reference', cell: ({ row }) => row.original.referenceTransaction || '—' },
    { id: 'status', header: 'Status', cell: ({ row }) => <MovementStatus status={row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          pending={row.original.status === 'PENDING'}
          primaryLabel="Process"
          onPrimary={() => setPendingAction({ kind: 'process', row: row.original })}
          onReject={() => setPendingAction({ kind: 'reject', row: row.original })}
        />
      ),
    },
  ];

  const target = pendingAction?.row;
  return (
    <div className="w-full">
      <ListToolbar actions={<Button text="New return" type="button" onClick={openSheet} />}>
        <MovementFilters
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          statusOptions={STATUS_OPTIONS}
        />
      </ListToolbar>
      <DataGrid
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        {...tableProps(data?.meta, data?.data?.length)}
      />
      <NewReturnSheet key={sheetKey} open={sheetOpen} setOpen={setSheetOpen} />
      <ConfirmDialog
        open={!!pendingAction}
        title={pendingAction?.kind === 'process' ? 'Process this return?' : 'Reject this return?'}
        description={
          target &&
          (pendingAction?.kind === 'process'
            ? target.restockItems
              ? `${target.quantity} × ${target.product?.name ?? 'item'} will be added back to stock.`
              : 'The return will be closed without changing stock.'
            : 'The return will be closed and stock will not change.')
        }
        confirmText={pendingAction?.kind === 'process' ? 'Process' : 'Reject'}
        danger={pendingAction?.kind === 'reject'}
        loading={processReturn.isPending || rejectReturn.isPending}
        onConfirm={confirm}
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
};

export default ReturnsManager;
