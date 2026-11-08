'use client';

import React, { useState } from 'react';
import { Bell, ChatText, DeviceMobile, EnvelopeSimple, type Icon } from '@phosphor-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@potta/components/ui/table';
import { useNotificationLogs } from '../hooks';
import type { NotificationChannel, NotificationLogStatus } from '../utils/api';
import { formatDateTime } from '../utils/format';
import Pager from './Pager';
import { MessageRow, SkeletonRows, errorMessage } from './TableStates';

const COLUMNS = 6;
const ALL = '__all__';

const CHANNELS: { value: NotificationChannel; label: string; Icon: Icon }[] = [
  { value: 'email', label: 'Email', Icon: EnvelopeSimple },
  { value: 'sms', label: 'SMS', Icon: ChatText },
  { value: 'push', label: 'Push', Icon: DeviceMobile },
  { value: 'inapp', label: 'In-app', Icon: Bell },
];

const STATUSES: { value: NotificationLogStatus; label: string; tone: string }[] = [
  { value: 'PUBLISHED', label: 'Sent', tone: 'bg-green-50 text-green-800 border-green-200' },
  { value: 'FAILED', label: 'Failed', tone: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'SKIPPED', label: 'Skipped', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find((x) => x.value === status);
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[11px] font-medium ${s?.tone ?? 'border-gray-200 bg-gray-50 text-gray-700'}`}>
      {s?.label ?? status}
    </span>
  );
}

function ChannelCell({ channel }: { channel: string }) {
  const c = CHANNELS.find((x) => x.value === channel);
  const ChannelIcon = c?.Icon ?? Bell;
  return (
    <span className="inline-flex items-center gap-1.5">
      <ChannelIcon size={15} className="text-green-700" />
      {c?.label ?? channel}
    </span>
  );
}

export default function NotificationLogsPanel() {
  const [channel, setChannel] = useState<NotificationChannel | ''>('');
  const [status, setStatus] = useState<NotificationLogStatus | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const { data, isLoading, isFetching, isError, error, refetch } = useNotificationLogs({
    channel: channel || undefined,
    status: status || undefined,
    page,
    limit,
  });
  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 border border-black/10 bg-white p-4">
        <label className="flex w-[180px] flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Channel</span>
          <Select
            value={channel || ALL}
            onValueChange={(v) => {
              setChannel(v === ALL ? '' : (v as NotificationChannel));
              setPage(1);
            }}
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
          <span className="text-xs font-medium text-gray-600">Status</span>
          <Select
            value={status || ALL}
            onValueChange={(v) => {
              setStatus(v === ALL ? '' : (v as NotificationLogStatus));
              setPage(1);
            }}
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
        <p className="ml-auto max-w-sm text-xs text-gray-500">
          Messages Potta handed to Instanvi Talk for delivery (emails, SMS, push and in-app).
        </p>
      </div>

      <div className="overflow-hidden border border-black/10 bg-white">
        <Table>
          <TableHeader className="bg-[#ecf8f4] [&_tr]:border-black/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[170px]">Time</TableHead>
              <TableHead className="w-[110px]">Channel</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Event / subject</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows columns={COLUMNS} />
            ) : isError ? (
              <MessageRow
                columns={COLUMNS}
                tone="error"
                title="Could not load sent notifications"
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
                title="No notifications sent yet"
                description={channel || status ? 'Try another channel or status.' : undefined}
              />
            ) : (
              rows.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-gray-600">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <ChannelCell channel={log.channel} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate" title={log.recipient ?? undefined}>
                    {log.recipient || '—'}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="truncate font-medium" title={log.subject ?? undefined}>
                      {log.subject || '—'}
                    </p>
                    {log.businessEvent ? (
                      <p className="truncate font-mono text-[11px] text-gray-500" title={log.businessEvent}>
                        {log.businessEvent}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-red-700" title={log.error ?? undefined}>
                    {log.error || <span className="text-gray-400">—</span>}
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
    </div>
  );
}
