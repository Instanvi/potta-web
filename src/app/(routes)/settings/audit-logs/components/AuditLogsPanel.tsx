'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { useAuditLogs } from '../hooks';
import type { AuditLog, AuditLogQuery } from '../utils/api';
import { entityTypeLabel, formatDateTime, humanizeAction, shortId } from '../utils/format';
import AuditLogFilters, { EMPTY_AUDIT_FILTERS, type AuditFilterState } from './AuditLogFilters';
import AuditLogDetailSheet from './AuditLogDetailSheet';

function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const ACTOR_TONE: Record<string, string> = {
  USER: 'bg-brand-subtle text-primary',
  SERVICE: 'bg-sky-50 text-sky-800',
  SYSTEM: 'bg-muted text-muted-foreground',
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
    ),
  },
  {
    id: 'actor',
    header: 'Actor',
    cell: ({ row: { original: log } }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium ${ACTOR_TONE[log.actorType] ?? ACTOR_TONE.SYSTEM}`}>
          {log.actorType}
        </span>
        <span className="truncate" title={log.actorEmail || log.actorId || undefined}>
          {log.actorEmail || shortId(log.actorId, 12)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row: { original: log } }) => (
      <div className="min-w-0">
        <p className="font-medium">{humanizeAction(log.action, log.entityType)}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground" title={log.action}>
          {log.action}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'entityType',
    header: 'Record type',
    cell: ({ row }) => entityTypeLabel(row.original.entityType),
  },
  {
    accessorKey: 'entityId',
    header: 'Record ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs" title={row.original.entityId ?? undefined}>
        {shortId(row.original.entityId)}
      </span>
    ),
  },
];

export default function AuditLogsPanel() {
  const [filters, setFilters] = useState<AuditFilterState>(EMPTY_AUDIT_FILTERS);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const debounced = useDebounced(filters);
  const { page, limit, tableProps } = useServerPagination({ pageSize: 50, resetOn: [debounced] });

  const actorEmail = debounced.actor.includes('@') ? debounced.actor.trim().toLowerCase() : '';
  const query: AuditLogQuery = {
    entityType: debounced.entityType || undefined,
    action: debounced.action.trim() || undefined,
    actorId: !actorEmail && debounced.actor.trim() ? debounced.actor.trim() : undefined,
    from: debounced.from || undefined,
    to: debounced.to || undefined,
    page,
    limit,
  };
  const { data, isLoading, isError, error, refetch } = useAuditLogs(query);
  const pageRows = data?.data ?? [];

  const rows = useMemo(() => {
    if (!actorEmail) return pageRows;
    return pageRows.filter((l) => (l.actorEmail ?? '').toLowerCase().includes(actorEmail));
  }, [pageRows, actorEmail]);

  return (
    <div className="space-y-4">
      <AuditLogFilters value={filters} onChange={setFilters} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && (data?.meta.total ?? 0) === 0 ? (
        <EmptyState
          title="No activity found"
          description={
            Object.values(debounced).some(Boolean)
              ? 'Try widening the filters.'
              : 'Changes to books, sales and master data will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          onRowClick={setSelected}
          pageSizeOptions={[25, 50, 100]}
          {...tableProps(data?.meta, pageRows.length)}
        />
      )}

      <AuditLogDetailSheet log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
