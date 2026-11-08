'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@potta/components/ui/table';
import { useAuditLogs } from '../hooks';
import type { AuditLog, AuditLogQuery } from '../utils/api';
import { entityTypeLabel, formatDateTime, humanizeAction, shortId } from '../utils/format';
import AuditLogFilters, { EMPTY_AUDIT_FILTERS, type AuditFilterState } from './AuditLogFilters';
import AuditLogDetailSheet from './AuditLogDetailSheet';
import Pager from './Pager';
import { MessageRow, SkeletonRows, errorMessage } from './TableStates';

const COLUMNS = 5;

function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const ACTOR_TONE: Record<string, string> = {
  USER: 'bg-green-50 text-green-800',
  SERVICE: 'bg-sky-50 text-sky-800',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

export default function AuditLogsPanel() {
  const [filters, setFilters] = useState<AuditFilterState>(EMPTY_AUDIT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const debounced = useDebounced(filters);

  useEffect(() => setPage(1), [debounced]);

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
  const { data, isLoading, isFetching, isError, error, refetch } = useAuditLogs(query);

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    if (!actorEmail) return list;
    return list.filter((l) => (l.actorEmail ?? '').toLowerCase().includes(actorEmail));
  }, [data, actorEmail]);

  return (
    <div className="space-y-4">
      <AuditLogFilters value={filters} onChange={setFilters} />

      <div className="overflow-hidden border border-black/10 bg-white">
        <Table>
          <TableHeader className="bg-[#ecf8f4] [&_tr]:border-black/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[170px]">Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[160px]">Record type</TableHead>
              <TableHead className="w-[130px]">Record ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows columns={COLUMNS} />
            ) : isError ? (
              <MessageRow
                columns={COLUMNS}
                tone="error"
                title="Could not load the audit log"
                description={errorMessage(error, 'Please try again.')}
                action={
                  <button type="button" className="border border-black/15 px-3 py-1.5 text-xs hover:bg-gray-50" onClick={() => refetch()}>
                    Retry
                  </button>
                }
              />
            ) : rows.length === 0 ? (
              <MessageRow
                columns={COLUMNS}
                title="No activity found"
                description={Object.values(debounced).some(Boolean) ? 'Try widening the filters.' : 'Changes to books, sales and master data will appear here.'}
              />
            ) : (
              rows.map((log) => (
                <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
                  <TableCell className="whitespace-nowrap text-gray-600">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium ${ACTOR_TONE[log.actorType] ?? ACTOR_TONE.SYSTEM}`}>
                        {log.actorType}
                      </span>
                      <span className="truncate" title={log.actorEmail || log.actorId || undefined}>
                        {log.actorEmail || shortId(log.actorId, 12)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{humanizeAction(log.action, log.entityType)}</p>
                    <p className="truncate font-mono text-[11px] text-gray-500" title={log.action}>
                      {log.action}
                    </p>
                  </TableCell>
                  <TableCell>{entityTypeLabel(log.entityType)}</TableCell>
                  <TableCell className="font-mono text-xs" title={log.entityId ?? undefined}>
                    {shortId(log.entityId)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isError ? (
          <Pager
            meta={data?.meta}
            isFetching={isFetching && !isLoading}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        ) : null}
      </div>

      <AuditLogDetailSheet log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
