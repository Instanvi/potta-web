'use client';
import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '../pos/inventory/_utils/api';

const input = 'h-12 rounded-[2px] border border-input bg-white px-3 text-sm outline-none focus:border-primary';

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
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">Loading…</p>;
  if (!rows.length) return <p className="p-4 text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{rows.map(render)}</div>;
}

export function AttributeCreateForm() {
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [options, setOptions] = useState('');
  const mutation = useMutation({
    mutationFn: () =>
      catalogApi.createLabel({
        name: name.trim(),
        options: options.split(',').map((o) => o.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success(`Attribute "${name.trim()}" created`);
      setName('');
      setOptions('');
      client.invalidateQueries({ queryKey: ['product-labels'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the attribute'),
  });
  return (
    <form
      className="mb-4 flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Attribute name is required');
        mutation.mutate();
      }}
    >
      <input className={input} placeholder="Name (Size)" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={`${input} min-w-[16rem]`} placeholder="Options, comma separated (S, M, L)" value={options} onChange={(e) => setOptions(e.target.value)} />
      <button type="submit" disabled={mutation.isPending} className="h-12 rounded-[2px] bg-primary px-3 text-sm font-medium text-white disabled:opacity-60">
        {mutation.isPending ? 'Saving…' : 'Add attribute'}
      </button>
    </form>
  );
}

export function UnitCreateForm() {
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [factor, setFactor] = useState('1');
  const mutation = useMutation({
    mutationFn: () => catalogApi.createUnit({ name: name.trim(), symbol: symbol.trim() || name.trim(), factor: Number(factor) || 1 }),
    onSuccess: () => {
      toast.success(`Unit "${name.trim()}" created`);
      setName('');
      setSymbol('');
      setFactor('1');
      client.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the unit'),
  });
  return (
    <form
      className="mb-4 flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Unit name is required');
        mutation.mutate();
      }}
    >
      <input className={input} placeholder="Name (Carton)" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} placeholder="Symbol (ctn)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      <input className={`${input} w-24`} type="number" min={0} step="any" placeholder="Factor" value={factor} onChange={(e) => setFactor(e.target.value)} />
      <button type="submit" disabled={mutation.isPending} className="h-12 rounded-[2px] bg-primary px-3 text-sm font-medium text-white disabled:opacity-60">
        {mutation.isPending ? 'Saving…' : 'Add unit'}
      </button>
    </form>
  );
}

export function ModifierCreateForm() {
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const mutation = useMutation({
    mutationFn: () => catalogApi.createModifier({ name: name.trim(), price: Number(price) || 0 }),
    onSuccess: () => {
      toast.success(`Modifier "${name.trim()}" created`);
      setName('');
      setPrice('');
      client.invalidateQueries({ queryKey: ['product-modifiers'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create the modifier'),
  });
  return (
    <form
      className="mb-4 flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Modifier name is required');
        mutation.mutate();
      }}
    >
      <input className={input} placeholder="Name (Gift wrap)" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={`${input} w-28`} type="number" min={0} step="any" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button type="submit" disabled={mutation.isPending} className="h-12 rounded-[2px] bg-primary px-3 text-sm font-medium text-white disabled:opacity-60">
        {mutation.isPending ? 'Saving…' : 'Add modifier'}
      </button>
    </form>
  );
}

export const loadLabels = () => catalogApi.labels();
export const loadUnits = () => catalogApi.units();
export const loadModifiers = () => catalogApi.modifiers();
