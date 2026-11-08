'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Input from '@potta/components/input';
import { formatDateTime } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { useMappings } from '../hooks';
import { MappingItem, PosSyncKind } from '../utils/api';
import { CursorPager, KindFilter, Mono, useCursorPager } from './shared';

const LIMIT = 50;

const columns: ColumnDef<MappingItem>[] = [
  { accessorKey: 'kind', header: 'Kind' },
  {
    accessorKey: 'external_id',
    header: 'Desktop id',
    cell: ({ row }) => <Mono>{row.original.external_id}</Mono>,
  },
  {
    accessorKey: 'potta_id',
    header: 'Potta id',
    cell: ({ row }) => <Mono>{row.original.potta_id}</Mono>,
  },
  {
    accessorKey: 'business_key',
    header: 'Business key',
    cell: ({ row }) => row.original.business_key ?? '—',
  },
  { accessorKey: 'storage_tier', header: 'Tier' },
  {
    accessorKey: 'updated_at',
    header: 'Updated',
    cell: ({ row }) => formatDateTime(row.original.updated_at),
  },
];

const MappingsPanel = () => {
  const [kinds, setKinds] = useState<PosSyncKind[]>([]);
  const [since, setSince] = useState('');
  const pager = useCursorPager();
  const { data, isLoading, isFetching, error, refetch } = useMappings({
    cursor: pager.cursor,
    limit: LIMIT,
    kinds: kinds.length ? kinds : undefined,
    since: since || undefined,
  });
  const rows = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <KindFilter
          value={kinds}
          onChange={(k) => {
            setKinds(k);
            pager.reset();
          }}
        />
        <div className="w-48">
          <Input
            type="date"
            name="since"
            label="Updated since"
            value={since}
            onchange={(e) => {
              setSince(e.target.value);
              pager.reset();
            }}
          />
        </div>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No mappings"
          description="Mappings are created when the POS desktop app pushes records."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            withRowSelection={false}
            showPagination={false}
            pageSize={LIMIT}
          />
          <CursorPager
            page={pager.page}
            hasMore={!!data?.has_more}
            isFetching={isFetching && !isLoading}
            onPrev={pager.prev}
            onNext={() => pager.next(data?.next_cursor)}
          />
        </>
      )}
    </div>
  );
};

export default MappingsPanel;
