'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef, PaginationState, Updater } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import { formatDateTime } from '../../../_shared/format';
import {
  ErrorState,
  LoadingState,
  Panel,
  StatCard,
  StatusBadge,
} from '../../../_shared/states';
import { useSyncRequest, useSyncRequests } from '../hooks';
import {
  STATUS_LABELS,
  SyncRequest,
  SyncRequestStatus,
  SyncRequestSummary,
  SyncRequestTallies,
  endpointLabel,
} from '../utils/api';
import { Mono } from './shared';

const PAGE_SIZE = 20;
const POLL_MS = 4000;

const STATUS_TONES: Record<SyncRequestStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'neutral',
  SUCCEEDED: 'success',
  FAILED: 'danger',
};

type StatusFilter = 'ALL' | SyncRequestStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PROCESSING', label: 'Ongoing' },
  { id: 'FAILED', label: 'Failed' },
  { id: 'SUCCEEDED', label: 'Success' },
];

function formatTallies(t: SyncRequestTallies): string {
  const parts: string[] = [];
  if (t.created) parts.push(`${t.created} created`);
  if (t.updated) parts.push(`${t.updated} updated`);
  if (t.duplicate) parts.push(`${t.duplicate} duplicate`);
  if (t.failed) parts.push(`${t.failed} failed`);
  return parts.length ? parts.join(' · ') : '—';
}

function summarizeDetailResponse(response: Record<string, unknown> | null): SyncRequestTallies {
  const tallies = { created: 0, updated: 0, duplicate: 0, failed: 0 };
  if (!response) return tallies;
  const rows = Array.isArray(response.rows)
    ? response.rows
    : Array.isArray(response.results)
      ? response.results
      : [];
  for (const row of rows) {
    const status = String((row as { status?: string })?.status ?? '').toLowerCase();
    if (status === 'created') tallies.created += 1;
    else if (status === 'updated') tallies.updated += 1;
    else if (status === 'duplicate') tallies.duplicate += 1;
    else if (status === 'failed') tallies.failed += 1;
  }
  return tallies;
}

const SyncActivityPanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get('request')?.trim() || '';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(deepLinkId);

  useEffect(() => {
    if (deepLinkId) setSelectedId(deepLinkId);
  }, [deepLinkId]);

  const listParams = useMemo(
    () => ({
      page: pageIndex + 1,
      limit: PAGE_SIZE,
      ...(statusFilter !== 'ALL' ? { status: statusFilter as SyncRequestStatus } : {}),
    }),
    [pageIndex, statusFilter],
  );

  const listQuery = useSyncRequests(listParams, {
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const active =
        data.counts.PENDING > 0 ||
        data.counts.PROCESSING > 0 ||
        data.items.some((r) => r.status === 'PENDING' || r.status === 'PROCESSING');
      return active ? POLL_MS : false;
    },
  });

  const items = listQuery.data?.items ?? [];
  const counts = listQuery.data?.counts ?? {
    PENDING: 0,
    PROCESSING: 0,
    SUCCEEDED: 0,
    FAILED: 0,
  };
  const total = listQuery.data?.total ?? 0;

  const openDetail = (id: string) => {
    setSelectedId(id);
    const next = new URLSearchParams(searchParams.toString());
    next.set('request', id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const closeDetail = () => {
    setSelectedId('');
    const next = new URLSearchParams(searchParams.toString());
    next.delete('request');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const columns: ColumnDef<SyncRequestSummary>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge tone={STATUS_TONES[row.original.status]}>
          {STATUS_LABELS[row.original.status]}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'endpoint',
      header: 'What synced',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{endpointLabel(row.original.endpoint)}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.recordCount
              ? `${row.original.recordCount} record${row.original.recordCount === 1 ? '' : 's'}`
              : '—'}
          </p>
        </div>
      ),
    },
    {
      id: 'result',
      header: 'Result',
      cell: ({ row }) => {
        if (row.original.status === 'PENDING') {
          return <span className="text-muted-foreground">Queued</span>;
        }
        if (row.original.status === 'PROCESSING') {
          return <span className="text-muted-foreground">Working…</span>;
        }
        if (row.original.status === 'FAILED') {
          return (
            <span className="line-clamp-2 text-destructive">
              {row.original.errorMessage || 'Failed'}
            </span>
          );
        }
        return <span>{formatTallies(row.original.tallies)}</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Started',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Finished',
      cell: ({ row }) => {
        const done =
          row.original.status === 'SUCCEEDED' || row.original.status === 'FAILED';
        return (
          <span className="whitespace-nowrap">
            {done ? formatDateTime(row.original.updatedAt) : '—'}
          </span>
        );
      },
    },
    {
      id: 'issue',
      header: 'Issue',
      cell: ({ row }) =>
        row.original.errorMessage ? (
          <span className="line-clamp-2 max-w-[220px] text-xs text-destructive">
            {row.original.errorMessage}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'open',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => openDetail(row.original.id)}
        >
          Open
        </button>
      ),
    },
  ];

  const pagination: PaginationState = { pageIndex, pageSize: PAGE_SIZE };
  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    setPageIndex(next.pageIndex);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={counts.PENDING} />
        <StatCard label="Ongoing" value={counts.PROCESSING} />
        <StatCard
          label="Failed"
          value={counts.FAILED}
          tone={counts.FAILED > 0 ? 'destructive' : 'default'}
        />
        <StatCard label="Success" value={counts.SUCCEEDED} tone="success" />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = statusFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatusFilter(f.id);
                setPageIndex(0);
              }}
              className={
                active
                  ? 'h-8 rounded-[2px] border border-foreground bg-foreground px-3 text-xs font-medium text-background'
                  : 'h-8 rounded-[2px] border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-accent'
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {listQuery.error ? (
        <ErrorState error={listQuery.error} onRetry={() => listQuery.refetch()} />
      ) : (
        <DataTable
          emptyMessage="No sync activity yet"
          columns={columns}
          data={items}
          isLoading={listQuery.isLoading}
          manualPagination
          pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
          totalRows={total}
          pagination={pagination}
          pageSize={PAGE_SIZE}
          onPaginationChange={onPaginationChange}
          storageKey="pos-sync-activity-table"
        />
      )}

      <DetailSheet requestId={selectedId} onClose={closeDetail} />
    </div>
  );
};

function DetailSheet({
  requestId,
  onClose,
}: {
  requestId: string;
  onClose: () => void;
}) {
  const open = !!requestId;
  const detail = useSyncRequest(requestId, {
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? POLL_MS : false;
    },
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col overflow-y-auto p-0 sm:max-w-[560px]"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>Sync details</SheetTitle>
          <SheetDescription>
            {detail.data ? endpointLabel(detail.data.endpoint) : 'Batch result'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-6 py-4">
          {!requestId ? null : detail.isLoading ? (
            <LoadingState />
          ) : detail.error ? (
            <ErrorState error={detail.error} onRetry={() => detail.refetch()} />
          ) : detail.data ? (
            <DetailBody data={detail.data} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailBody({ data }: { data: SyncRequest }) {
  const tallies = summarizeDetailResponse(data.response);
  const [showRaw, setShowRaw] = useState(false);
  const errorMessage =
    data.status === 'FAILED'
      ? String(
          (data.error as { message?: string } | null)?.message ?? 'Sync failed',
        )
      : null;

  return (
    <>
      <Panel className="grid grid-cols-[120px_1fr] items-center gap-x-4 gap-y-2 p-4 text-sm">
        <span className="text-muted-foreground">Status</span>
        <span>
          <StatusBadge tone={STATUS_TONES[data.status]}>{STATUS_LABELS[data.status]}</StatusBadge>
        </span>
        <span className="text-muted-foreground">What synced</span>
        <span>{endpointLabel(data.endpoint)}</span>
        <span className="text-muted-foreground">Started</span>
        <span>{formatDateTime(data.createdAt)}</span>
        <span className="text-muted-foreground">Updated</span>
        <span>{formatDateTime(data.updatedAt)}</span>
        <span className="text-muted-foreground">Request id</span>
        <Mono>{data.id}</Mono>
      </Panel>

      {(data.status === 'SUCCEEDED' ||
        tallies.created + tallies.updated + tallies.duplicate + tallies.failed > 0) && (
        <div>
          <p className="mb-2 text-sm font-medium">Result</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatCard label="Created" value={tallies.created} />
            <StatCard label="Updated" value={tallies.updated} />
            <StatCard label="Duplicate" value={tallies.duplicate} />
            <StatCard
              label="Failed"
              value={tallies.failed}
              tone={tallies.failed > 0 ? 'destructive' : 'default'}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div>
          <p className="mb-1 text-sm font-medium text-destructive">Issue</p>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div>
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? 'Hide technical details' : 'Show technical details'}
        </button>
        {showRaw && (
          <div className="mt-2 space-y-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Endpoint</p>
              <Mono>{data.endpoint}</Mono>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Idempotency key</p>
              <Mono>{data.idempotencyKey}</Mono>
            </div>
            {data.error && (
              <pre className="max-h-48 overflow-auto bg-destructive/5 p-3 text-xs">
                {JSON.stringify(data.error, null, 2)}
              </pre>
            )}
            {data.response && (
              <pre className="max-h-72 overflow-auto bg-muted/40 p-3 text-xs">
                {JSON.stringify(data.response, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default SyncActivityPanel;
