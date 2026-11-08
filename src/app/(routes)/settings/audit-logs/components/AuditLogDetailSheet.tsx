'use client';

import React from 'react';
import { ArrowRight, Copy } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import type { AuditLog } from '../utils/api';
import { entityTypeLabel, formatDateTime, humanizeAction, prettyJson, statusChange } from '../utils/format';

function copy(value: string) {
  void navigator.clipboard
    ?.writeText(value)
    .then(() => toast.success('Copied'))
    .catch(() => toast.error('Could not copy'));
}

function Meta({ label, value, mono, copyable }: { label: string; value?: string | null; mono?: boolean; copyable?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={`mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-black ${mono ? 'font-mono text-xs' : ''}`}>
        <span className="truncate" title={value ?? undefined}>
          {value || '—'}
        </span>
        {copyable && value ? (
          <button type="button" className="shrink-0 text-gray-400 hover:text-green-700" onClick={() => copy(value)} aria-label={`Copy ${label}`}>
            <Copy size={13} />
          </button>
        ) : null}
      </dd>
    </div>
  );
}

function JsonPane({ title, value, tone }: { title: string; value: unknown; tone: 'before' | 'after' }) {
  const text = prettyJson(value);
  return (
    <div className="flex min-w-0 flex-col border border-black/10">
      <div
        className={`flex items-center justify-between border-b border-black/10 px-3 py-2 text-xs font-medium ${
          tone === 'before' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}
      >
        {title}
        {text ? (
          <button type="button" className="text-gray-500 hover:text-black" onClick={() => copy(text)} aria-label={`Copy ${title}`}>
            <Copy size={13} />
          </button>
        ) : null}
      </div>
      {text ? (
        <pre className="max-h-[55vh] min-h-[120px] overflow-auto whitespace-pre bg-[var(--main-bg)] p-3 font-mono text-[11px] leading-relaxed text-black">
          {text}
        </pre>
      ) : (
        <p className="flex min-h-[120px] items-center justify-center bg-[var(--main-bg)] p-3 text-xs text-gray-500">No data recorded</p>
      )}
    </div>
  );
}

export default function AuditLogDetailSheet({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  const change = log ? statusChange(log) : null;

  return (
    <Sheet open={Boolean(log)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-4xl">
        {log ? (
          <div className="space-y-6">
            <SheetHeader className="pr-8">
              <SheetTitle>{humanizeAction(log.action, log.entityType)}</SheetTitle>
              <SheetDescription>
                {formatDateTime(log.createdAt)} · {log.actorEmail || log.actorId || log.actorType}
              </SheetDescription>
            </SheetHeader>

            {change ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Status</span>
                <span className="bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{change.from ?? '—'}</span>
                <ArrowRight size={12} className="text-gray-400" />
                <span className="bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">{change.to ?? '—'}</span>
              </div>
            ) : null}

            <dl className="grid grid-cols-1 gap-4 border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Meta label="Action" value={log.action} mono />
              <Meta label="Record" value={entityTypeLabel(log.entityType)} />
              <Meta label="Record ID" value={log.entityId} mono copyable />
              <Meta label="Actor type" value={log.actorType} />
              <Meta label="Actor email" value={log.actorEmail} />
              <Meta label="Actor ID" value={log.actorId} mono copyable />
              <Meta label="Location context" value={log.locationContextId} mono copyable />
              <Meta label="Request ID" value={log.requestId} mono copyable />
              <Meta label="IP address" value={log.ip} mono />
              <div className="sm:col-span-2 lg:col-span-3">
                <Meta label="User agent" value={log.userAgent} />
              </div>
            </dl>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <JsonPane title="Before" value={log.before} tone="before" />
              <JsonPane title="After" value={log.after} tone="after" />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
