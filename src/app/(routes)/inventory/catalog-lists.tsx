'use client';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../pos/inventory/_utils/api';

export function CatalogList({
  queryKey,
  loader,
  render,
}: {
  queryKey: string;
  loader: () => Promise<any>;
  render: (row: any) => ReactNode;
}) {
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: loader });
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">Loading…</p>;
  if (!rows.length) return <p className="p-4 text-sm text-muted-foreground">Nothing synced from Pay yet.</p>;
  return <div className="space-y-2">{rows.map(render)}</div>;
}

export const loadLabels = () => catalogApi.labels();
export const loadUnits = () => catalogApi.units();
export const loadModifiers = () => catalogApi.modifiers({ scope: 'org' });
