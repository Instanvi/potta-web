'use client';

import React from 'react';
import { ArrowRight, ClockCounterClockwise } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { useCan } from '@/components/auth/can';
import { useRecordHistory } from '@potta/app/(routes)/settings/audit-logs/hooks';
import {
  formatDateTime,
  humanizeAction,
  statusChange,
} from '@potta/app/(routes)/settings/audit-logs/utils/format';

/** Compact audit timeline for one record; hidden for users without AuditLog:view. */
export default function RecordHistory({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { canAccess } = useCan();
  const allowed = canAccess('AuditLog', 'view');
  const { data, isLoading, isError, refetch } = useRecordHistory(entityType, entityId, allowed);

  if (!allowed) return null;
  const items = data?.data ?? [];

  return (
    <div className="border border-gray-200 bg-white p-4">
      <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
        <ClockCounterClockwise size={16} className="text-green-700" />
        History
      </h4>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/2 animate-pulse bg-gray-200" />
                <div className="h-2.5 w-1/3 animate-pulse bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-xs text-red-600">
          Could not load history.{' '}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500">No recorded changes yet.</p>
      ) : (
        <ol className="relative ml-1 border-l border-gray-200">
          {items.map((log, index) => {
            const change = statusChange(log);
            return (
              <li key={log.id} className="relative pb-4 pl-4 last:pb-0">
                <span
                  className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                    index === 0 ? 'bg-green-700' : 'bg-gray-300'
                  }`}
                />
                <p className="text-sm font-medium text-gray-900">{humanizeAction(log.action, log.entityType)}</p>
                {change ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="bg-gray-100 px-1.5 py-0.5">{change.from ?? '—'}</span>
                    <ArrowRight size={10} />
                    <span className="bg-green-50 px-1.5 py-0.5 text-green-800">{change.to ?? '—'}</span>
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-gray-500" title={formatDateTime(log.createdAt)}>
                  {log.actorEmail || (log.actorType === 'USER' ? 'Unknown user' : log.actorType.toLowerCase())} ·{' '}
                  {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : '—'}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
