'use client';
import { ReactNode } from 'react';
import Button from '@potta/components/button';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
import { useEntityHealth } from '../hooks';
import { Mono } from './shared';

const Section = ({
  title,
  description,
  count,
  headers,
  rows,
}: {
  title: string;
  description: string;
  count: number;
  headers: string[];
  rows: ReactNode[][];
}) => (
  <section className="border border-gray-200">
    <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <span
        className={`px-2 py-0.5 text-xs font-medium border ${
          count === 0
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-yellow-300 bg-yellow-50 text-yellow-700'
        }`}
      >
        {count === 0 ? 'Healthy' : `${count} issue${count === 1 ? '' : 's'}`}
      </span>
    </div>
    {count > 0 && (
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i} className="border-t border-gray-100">
                {cells.map((c, j) => (
                  <td key={j} className="px-4 py-2 align-top">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

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
        count={data.unmapped_native.length}
        headers={['Kind', 'Potta id', 'Business key']}
        rows={data.unmapped_native.map((r) => [
          r.kind,
          <Mono key="id">{r.potta_id}</Mono>,
          r.business_key ?? '—',
        ])}
      />
      <Section
        title="Orphan cross-references"
        description="Desktop references pointing to records that were never synced."
        count={data.orphan_cross_refs.length}
        headers={['From', 'To', 'Relation']}
        rows={data.orphan_cross_refs.map((r) => [
          <span key="from">
            {r.from_kind} <Mono>{r.from_external_id}</Mono>
          </span>,
          <span key="to">
            {r.to_kind} <Mono>{r.to_external_id}</Mono>
          </span>,
          r.relation,
        ])}
      />
      <Section
        title="Stale mappings"
        description="Mappings whose Potta record no longer exists."
        count={data.stale_mappings.length}
        headers={['Kind', 'External id', 'Potta id']}
        rows={data.stale_mappings.map((r) => [
          r.kind,
          <Mono key="ext">{r.external_id}</Mono>,
          <Mono key="id">{r.potta_id}</Mono>,
        ])}
      />
      <Section
        title="Duplicate business keys"
        description="Several records share the same business key (e.g. SKU)."
        count={data.duplicate_business_keys.length}
        headers={['Kind', 'Business key', 'Count']}
        rows={data.duplicate_business_keys.map((r) => [r.kind, r.business_key, r.count])}
      />
    </div>
  );
};

export default EntityHealthPanel;
