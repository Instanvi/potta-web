'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import RootLayout from '@/app/(routes)/layout';
import {
  EmptyState,
  ErrorState,
  ListToolbar,
  PageContainer,
  Panel,
  Tabs,
} from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { Button } from '@/components/shadcn/button';
import { FIELD_INPUT } from '@/lib/field-styles';
import { booksApi, extractBooksRows, rowId } from '@/lib/books-api';
import axios, { payrollClient } from 'config/axios.config';
import { cn } from '@/lib/utils';

export type HubTab = {
  id: string;
  label: string;
  /** Books filter path, GET path, or payroll path */
  path: string;
  listMode?: 'filter' | 'get' | 'payroll';
  columns: { key: string; label: string }[];
};

export function BooksTransactionsHub({
  tabs,
  defaultTab,
}: {
  tabs: HubTab[];
  defaultTab?: string;
}) {
  const [tab, setTab] = useState(defaultTab ?? tabs[0]?.id ?? '');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');

  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  const load = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setError(null);
    try {
      let data: unknown;
      if (active.listMode === 'payroll') {
        const res = await payrollClient.get(`/${active.path.replace(/^\//, '')}`, {
          params: { page: 1, limit: 50, search: search.trim() || undefined },
        });
        data = res.data?.data ?? res.data;
      } else if (active.listMode === 'get') {
        const res = await axios.get(`/${active.path}`, {
          params: { page: 1, limit: 50, search: search.trim() || undefined },
        });
        data = res.data;
      } else {
        const filter: Record<string, unknown> = {};
        if (search.trim()) filter.search = search.trim();
        data = await booksApi.list(active.path, filter, {
          page: 1,
          limit: 50,
          sortBy: 'createdAt:DESC',
        });
      }
      const extracted = extractBooksRows(data);
      setRows(
        extracted.map((r) => ({
          ...r,
          _type: active.label,
        }))
      );
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [active, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = active?.columns ?? [];
  const hubColumns = useMemo(
    () => [{ key: '_type', label: 'Type' }, ...columns],
    [columns],
  );
  const hubRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        _type: row._type ?? active?.label ?? '',
      })),
    [rows, active?.label],
  );

  return (
    <RootLayout>
      <PageContainer>
        <Tabs
          tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
          value={tab}
          onChange={setTab}
        />
        <ListToolbar
          actions={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => void load()}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <i className={`ri-refresh-line text-base ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void load();
            }}
            placeholder="Search…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState title="No transactions" description="Nothing matched this type." />
          ) : (
            <BooksListTable
              columns={hubColumns}
              rows={hubRows}
            />
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
}
