'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DatePicker } from '@potta/components/ui/date-picker';
import { formatDateTime } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { useMappings } from '../hooks';
import { MappingItem, PosSyncKind } from '../utils/api';
import { KindFilter, Mono, useCursorTable } from './shared';

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
  const pager = useCursorTable(LIMIT);
  const { data, isLoading, error, refetch } = useMappings({
    cursor: pager.cursor,
    limit: pager.limit,
    kinds: kinds.length ? kinds : undefined,
    since: since || undefined,
  });
  const rows = data?.items ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <KindFilter
          value={kinds}
          onChange={(k) => {
            setKinds(k);
            pager.reset();
          }}
        />
        <DatePicker
          label="Updated since"
          name="since"
          className="w-52"
          clearable
          value={since}
          onChange={(value) => {
            setSince(value);
            pager.reset();
          }}
        />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 && pager.pageIndex === 0 ? (
        <EmptyState
          title="No mappings"
          description="Mappings are created when the POS desktop app pushes records."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          {...pager.tableProps({ nextCursor: data?.next_cursor, hasMore: data?.has_more }, rows.length)}
        />
      )}
    </div>
  );
};

export default MappingsPanel;
