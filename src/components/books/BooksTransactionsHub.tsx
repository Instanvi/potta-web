'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import RootLayout from '@/app/(routes)/layout';
import {
  ErrorState,
  ListToolbar,
  PageContainer,
  Tabs,
} from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { useDataTableHandle } from '@/components/ui/data-table';
import { ListActionsMenu, ListActionItem } from '@/components/list-actions-menu';
import { FIELD_INPUT } from '@/lib/field-styles';
import { booksApi, extractBooksRows, rowId } from '@/lib/books-api';
import axios from 'config/axios.config';
import { cn } from '@/lib/utils';
import { useBooksLabelMaps } from '@/hooks/use-books-label-maps';

export type HubTab = {
  id: string;
  label: string;
  /** Books filter path or GET path on potta-backend */
  path: string;
  listMode?: 'filter' | 'get';
  columns: { key: string; label: string; type?: string }[];
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
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();

  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  const load = useCallback(async () => {
    if (!active) return;
    setLoading(true);
    setError(null);
    try {
      let data: unknown;
      if (active.listMode === 'get') {
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
  const { formatCell } = useBooksLabelMaps(hubColumns);
  const hubRows = useMemo<Record<string, unknown>[]>(
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
            <>
              <ListActionsMenu table={table}>
                <ListActionItem
                  label="Refresh"
                  icon={<i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`} />}
                  disabled={loading}
                  onSelect={() => void load()}
                />
              </ListActionsMenu>
            </>
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
          ) : (
            <BooksListTable
              columns={hubColumns}
              rows={hubRows}
              storageKey="books-transactions-hub-table"
              isLoading={loading}
              emptyMessage="No transactions"
              onTableChange={onTableChange}
              formatCell={formatCell}
            />
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
}
