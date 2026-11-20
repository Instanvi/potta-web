'use client';
import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { catalogApi } from '../pos/inventory/_utils/api';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@potta/components/ui/sheet';
import { EmptyState, ListToolbar } from '../_shared/states';
import { PanelCard, PanelCardContent } from '@/components/ui/panel-card';

export function CatalogList({
  queryKey,
  loader,
  render,
  empty,
}: {
  queryKey: string;
  loader: () => Promise<any>;
  render: (row: any) => ReactNode;
  empty: string;
}) {
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: loader });
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  if (isLoading) {
    return (
      <PanelCard>
        <PanelCardContent>
          <p className="text-sm text-black/70">Loading…</p>
        </PanelCardContent>
      </PanelCard>
    );
  }
  if (!rows.length) {
    return <EmptyState title={empty} />;
  }
  return (
    <PanelCard>
      <PanelCardContent className="space-y-2 p-4">{rows.map(render)}</PanelCardContent>
    </PanelCard>
  );
}

function CatalogCreateSheet({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  pending,
  submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: () => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="left" className="flex w-full flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form
          className="mt-6 flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-4">{children}</div>
          <SheetFooter className="mt-auto flex justify-end gap-2 pt-6">
            <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
            <Button text={submitLabel} type="submit" isLoading={pending} disabled={pending} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function AttributeCreateForm() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [options, setOptions] = useState('');

  const reset = () => {
    setName('');
    setOptions('');
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: () =>
      catalogApi.createLabel({
        name: name.trim(),
        options: options
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      toast.success(`Attribute "${name.trim()}" created`);
      close();
      client.invalidateQueries({ queryKey: ['product-labels'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the attribute'),
  });

  return (
    <>
      <ListToolbar
        actions={
          <Button
            text="Add attribute"
            type="button"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          />
        }
      />
      <CatalogCreateSheet
        open={open}
        onClose={close}
        title="Add attribute"
        description="Variation attributes such as Size and Color."
        pending={mutation.isPending}
        submitLabel={mutation.isPending ? 'Saving…' : 'Add attribute'}
        onSubmit={() => {
          if (!name.trim()) return toast.error('Attribute name is required');
          mutation.mutate();
        }}
      >
        <Input
          type="text"
          name="name"
          label="Name"
          required
          placeholder="e.g. Size"
          value={name}
          onchange={(e) => setName(e.target.value)}
        />
        <Input
          type="text"
          name="options"
          label="Options"
          placeholder="Comma separated, e.g. S, M, L"
          value={options}
          onchange={(e) => setOptions(e.target.value)}
        />
      </CatalogCreateSheet>
    </>
  );
}

export function UnitCreateForm() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [factor, setFactor] = useState('1');

  const reset = () => {
    setName('');
    setSymbol('');
    setFactor('1');
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: () =>
      catalogApi.createUnit({
        name: name.trim(),
        symbol: symbol.trim() || name.trim(),
        factor: Number(factor) || 1,
      }),
    onSuccess: () => {
      toast.success(`Unit "${name.trim()}" created`);
      close();
      client.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the unit'),
  });

  return (
    <>
      <ListToolbar
        actions={
          <Button
            text="Add unit"
            type="button"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          />
        }
      />
      <CatalogCreateSheet
        open={open}
        onClose={close}
        title="Add unit"
        description="Sellable units for counting and packing items."
        pending={mutation.isPending}
        submitLabel={mutation.isPending ? 'Saving…' : 'Add unit'}
        onSubmit={() => {
          if (!name.trim()) return toast.error('Unit name is required');
          mutation.mutate();
        }}
      >
        <Input
          type="text"
          name="name"
          label="Name"
          required
          placeholder="e.g. Carton"
          value={name}
          onchange={(e) => setName(e.target.value)}
        />
        <Input
          type="text"
          name="symbol"
          label="Symbol"
          placeholder="e.g. ctn"
          value={symbol}
          onchange={(e) => setSymbol(e.target.value)}
        />
        <Input
          type="number"
          name="factor"
          label="Factor"
          min={0}
          placeholder="1"
          value={factor}
          onchange={(e) => setFactor(e.target.value)}
        />
      </CatalogCreateSheet>
    </>
  );
}

export function ModifierCreateForm() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const reset = () => {
    setName('');
    setPrice('');
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: () => catalogApi.createModifier({ name: name.trim(), price: Number(price) || 0 }),
    onSuccess: () => {
      toast.success(`Modifier "${name.trim()}" created`);
      close();
      client.invalidateQueries({ queryKey: ['product-modifiers'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the modifier'),
  });

  return (
    <>
      <ListToolbar
        actions={
          <Button
            text="Add modifier"
            type="button"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          />
        }
      />
      <CatalogCreateSheet
        open={open}
        onClose={close}
        title="Add modifier"
        description="Add-ons charged on top of an item."
        pending={mutation.isPending}
        submitLabel={mutation.isPending ? 'Saving…' : 'Add modifier'}
        onSubmit={() => {
          if (!name.trim()) return toast.error('Modifier name is required');
          mutation.mutate();
        }}
      >
        <Input
          type="text"
          name="name"
          label="Name"
          required
          placeholder="e.g. Gift wrap"
          value={name}
          onchange={(e) => setName(e.target.value)}
        />
        <Input
          type="number"
          name="price"
          label="Price"
          min={0}
          placeholder="0"
          value={price}
          onchange={(e) => setPrice(e.target.value)}
        />
      </CatalogCreateSheet>
    </>
  );
}

export const loadLabels = () => catalogApi.labels();
export const loadUnits = () => catalogApi.units();
export const loadModifiers = () => catalogApi.modifiers();
