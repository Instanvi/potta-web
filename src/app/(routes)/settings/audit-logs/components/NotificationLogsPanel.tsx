'use client';

import React, { useState } from 'react';
import { Bell, ChatText, DeviceMobile, EnvelopeSimple, type Icon } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { DataTable } from '@potta/components/ui/data-table';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { EmptyState, ErrorState, StatusBadge } from '../../../_shared/states';
import { useNotificationLogs } from '../hooks';
import type { NotificationChannel, NotificationLog, NotificationLogStatus } from '../utils/api';
import { formatDateTime } from '../utils/format';

const ALL = '__all__';

const CHANNELS: { value: NotificationChannel; label: string; Icon: Icon }[] = [
  { value: 'email', label: 'Email', Icon: EnvelopeSimple },
  { value: 'sms', label: 'SMS', Icon: ChatText },
  { value: 'push', label: 'Push', Icon: DeviceMobile },
  { value: 'inapp', label: 'In-app', Icon: Bell },
];

const STATUSES: { value: NotificationLogStatus; label: string; tone: 'success' | 'danger' | 'warning' }[] = [
  { value: 'PUBLISHED', label: 'Sent', tone: 'success' },
  { value: 'FAILED', label: 'Failed', tone: 'danger' },
  { value: 'SKIPPED', label: 'Skipped', tone: 'warning' },
];

function LogStatus({ status }: { status: string }) {
  const s = STATUSES.find((x) => x.value === status);
  return <StatusBadge tone={s?.tone ?? 'neutral'}>{s?.label ?? status}</StatusBadge>;
}

function ChannelCell({ channel }: { channel: string }) {
  const c = CHANNELS.find((x) => x.value === channel);
  const ChannelIcon = c?.Icon ?? Bell;
  return (
    <span className="inline-flex items-center gap-1.5">
      <ChannelIcon size={15} className="text-primary" />
      {c?.label ?? channel}
    </span>
  );
}

const columns: ColumnDef<NotificationLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => <ChannelCell channel={row.original.channel} />,
  },
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    cell: ({ row }) => (
      <span className="block max-w-[220px] truncate" title={row.original.recipient ?? undefined}>
        {row.original.recipient || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'subject',
    header: 'Event / subject',
    cell: ({ row: { original: log } }) => (
      <div className="max-w-[280px]">
        <p className="truncate font-medium" title={log.subject ?? undefined}>
          {log.subject || '—'}
        </p>
        {log.businessEvent ? (
          <p className="truncate font-mono text-[11px] text-muted-foreground" title={log.businessEvent}>
            {log.businessEvent}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <LogStatus status={row.original.status} />,
  },
  {
    accessorKey: 'error',
    header: 'Error',
    cell: ({ row }) => (
      <span className="block max-w-[260px] truncate text-xs text-destructive" title={row.original.error ?? undefined}>
        {row.original.error || <span className="text-muted-foreground">—</span>}
      </span>
    ),
  },
];

export default function NotificationLogsPanel() {
  const [channel, setChannel] = useState<NotificationChannel | ''>('');
  const [status, setStatus] = useState<NotificationLogStatus | ''>('');
  const { page, limit, tableProps } = useServerPagination({ pageSize: 50, resetOn: [channel, status] });

  const { data, isLoading, isError, error, refetch } = useNotificationLogs({
    channel: channel || undefined,
    status: status || undefined,
    page,
    limit,
  });
  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 dashboard-panel p-4">
        <label className="flex w-[180px] flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Channel</span>
          <Select
            value={channel || ALL}
            onValueChange={(v) => setChannel(v === ALL ? '' : (v as NotificationChannel))}
          >
            <SelectTrigger className="h-10 py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ALL}>All channels</SelectItem>
              {CHANNELS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex w-[180px] flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <Select
            value={status || ALL}
            onValueChange={(v) => setStatus(v === ALL ? '' : (v as NotificationLogStatus))}
          >
            <SelectTrigger className="h-10 py-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <p className="ml-auto max-w-sm text-xs text-muted-foreground">
          Messages Potta handed to Instanvi Talk for delivery (emails, SMS, push and in-app).
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No notifications sent yet"
          description={channel || status ? 'Try another channel or status.' : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          pageSizeOptions={[25, 50, 100]}
          {...tableProps(data?.meta, rows.length)}
        />
      )}
    </div>
  );
}
