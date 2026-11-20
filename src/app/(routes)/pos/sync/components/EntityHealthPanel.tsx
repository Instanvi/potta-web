'use client';
import { ColumnDef } from '@tanstack/react-table';
import Button from '@potta/components/button';
import { DataTable } from '@potta/components/ui/data-table';
import { EmptyState, ErrorState, LoadingState, Panel, StatusBadge } from '../../../_shared/states';
import { useEntityHealth } from '../hooks';
import { EntityHealthResponse } from '../utils/api';
import { Mono } from './shared';

type Row<K extends keyof EntityHealthResponse> = EntityHealthResponse[K][number];

const Section = <T,>({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: ColumnDef<T>[];
  rows: T[];
}) => (
  <Panel className="overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <StatusBadge tone={rows.length === 0 ? 'success' : 'warning'}>
        {rows.length === 0 ? 'Healthy' : `${rows.length} issue${rows.length === 1 ? '' : 's'}`}
      </StatusBadge>
    </div>
    {rows.length > 0 && (
      <DataTable
        className="rounded-none border-x-0 border-b-0"
        columns={columns}
        data={rows}
        withRowSelection={false}
        pageSize={10}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    )}
  </Panel>
);

const unmappedColumns: ColumnDef<Row<'unmapped_native'>>[] = [
  { accessorKey: 'kind', header: 'Kind' },
  { accessorKey: 'potta_id', header: 'Potta id', cell: ({ row }) => <Mono>{row.original.potta_id}</Mono> },
  { accessorKey: 'business_key', header: 'Business key', cell: ({ row }) => row.original.business_key ?? '—' },
];

const orphanColumns: ColumnDef<Row<'orphan_cross_refs'>>[] = [
  {
    accessorKey: 'from_kind',
    header: 'From',
    cell: ({ row }) => (
      <span>
        {row.original.from_kind} <Mono>{row.original.from_external_id}</Mono>
      </span>
    ),
  },
  {
    accessorKey: 'to_kind',
    header: 'To',
    cell: ({ row }) => (
      <span>
        {row.original.to_kind} <Mono>{row.original.to_external_id}</Mono>
      </span>
    ),
  },
  { accessorKey: 'relation', header: 'Relation' },
];

const staleColumns: ColumnDef<Row<'stale_mappings'>>[] = [
  { accessorKey: 'kind', header: 'Kind' },
  { accessorKey: 'external_id', header: 'External id', cell: ({ row }) => <Mono>{row.original.external_id}</Mono> },
  { accessorKey: 'potta_id', header: 'Potta id', cell: ({ row }) => <Mono>{row.original.potta_id}</Mono> },
];

const duplicateColumns: ColumnDef<Row<'duplicate_business_keys'>>[] = [
  { accessorKey: 'kind', header: 'Kind' },
  { accessorKey: 'business_key', header: 'Business key' },
  { accessorKey: 'count', header: 'Count' },
];

const EntityHealthPanel = () => {
  const { data, isLoading, isFetching, error, refetch } = useEntityHealth();

  if (isLoading) return <LoadingState label="Checking mapping health..." />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="No data" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          text={isFetching ? 'Refreshing...' : 'Re-run checks'}
          type="button"
          theme="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        />
      </div>
      <Section
        title="Unmapped native records"
        description="Potta records with no desktop mapping (e.g. created on the web)."
        columns={unmappedColumns}
        rows={data.unmapped_native}
      />
      <Section
        title="Orphan cross-references"
        description="Desktop references pointing to records that were never synced."
        columns={orphanColumns}
        rows={data.orphan_cross_refs}
      />
      <Section
        title="Stale mappings"
        description="Mappings whose Potta record no longer exists."
        columns={staleColumns}
        rows={data.stale_mappings}
      />
      <Section
        title="Duplicate business keys"
        description="Several records share the same business key (e.g. SKU)."
        columns={duplicateColumns}
        rows={data.duplicate_business_keys}
      />
    </div>
  );
};

export default EntityHealthPanel;
