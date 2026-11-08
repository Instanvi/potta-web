'use client';

import React, { useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Checks, Envelope, EnvelopeOpen, Trash } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import RootLayout from '../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import ConfirmDialog from '@potta/components/shared/ConfirmDialog';
import {
  useClearAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications,
  useToggleNotificationRead,
} from '@/hooks/use-notifications';
import {
  notificationBody,
  notificationHref,
  notificationTitle,
  type NotificationItem,
} from '@/services/notifications.service';
import { notificationVisual } from '@/lib/notification-visual';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unread' | 'read';
const PAGE_SIZE = 30;

export default function NotificationsPage() {
  const context = useContext(ContextData);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<NotificationItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useNotifications(page, PAGE_SIZE);
  const toggleRead = useToggleNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();
  const deleteOne = useDeleteNotification();

  const items = useMemo(() => data?.items ?? [], [data]);
  const unread = items.filter((n) => !n.isRead).length;
  const totalItems = data?.meta?.totalItems ?? items.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const visible = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.isRead);
    if (filter === 'read') return items.filter((n) => n.isRead);
    return items;
  }, [filter, items]);

  return (
    <RootLayout>
      <div
        className={`min-h-full space-y-5 bg-[var(--main-bg)] p-6 ${context?.layoutMode === 'sidebar' ? 'pl-16' : ''}`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-black">
              <Bell size={22} className="text-green-700" />
              Notifications
            </h1>
            <p className="text-sm text-gray-500">
              {unread} unread · {totalItems} total
              {isFetching && !isLoading ? ' · refreshing…' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 bg-green-700 px-3 text-sm text-white hover:bg-green-800 disabled:opacity-50"
              disabled={unread === 0 || markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <Checks size={16} />
              Mark all read
            </button>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 border border-red-200 bg-white px-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              disabled={items.length === 0 || clearAll.isPending}
              onClick={() => setConfirmClear(true)}
            >
              <Trash size={16} />
              Clear all
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                filter === tab.id ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-black/[0.04]',
              )}
            >
              {tab.label}
              {tab.id === 'unread' && unread > 0 ? <span className="ml-1.5 tabular-nums opacity-80">{unread}</span> : null}
            </button>
          ))}
        </div>

        <div className="overflow-hidden border border-black/10 bg-white">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 border-b border-black/[0.06] px-5 py-5 last:border-b-0">
                <div className="h-10 w-10 shrink-0 animate-pulse bg-gray-200" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-3.5 w-1/3 animate-pulse bg-gray-200" />
                  <div className="h-3 w-2/3 animate-pulse bg-gray-200" />
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-red-600">Could not load notifications</p>
              <button type="button" className="mt-2 text-xs text-green-700 hover:underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center bg-green-50 text-green-700">
                <Bell size={28} weight="duotone" />
              </span>
              <p className="text-sm font-medium text-black">
                {filter === 'unread' ? "You're all caught up" : filter === 'read' ? 'Nothing read yet' : 'No notifications yet'}
              </p>
              <p className="max-w-xs text-xs text-gray-500">
                Approvals, invoices, purchase orders and stock alerts from Potta appear here.
              </p>
              {filter !== 'all' && items.length > 0 ? (
                <button type="button" className="text-xs font-medium text-green-700 hover:underline" onClick={() => setFilter('all')}>
                  View all notifications
                </button>
              ) : null}
            </div>
          ) : (
            visible.map((n) => {
              const href = notificationHref(n);
              const body = notificationBody(n);
              const { Icon, tone } = notificationVisual(n);
              const isUnread = !n.isRead;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'group relative border-b border-black/[0.06] px-5 py-4 last:border-b-0',
                    isUnread && 'bg-green-50/40',
                  )}
                >
                  {isUnread ? <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-green-700" /> : null}
                  <div className="flex items-start gap-3.5">
                    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center', tone)}>
                      <Icon size={18} weight="duotone" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn('truncate text-sm text-black', isUnread ? 'font-medium' : 'font-normal')}>
                          {notificationTitle(n)}
                        </p>
                        <div className="flex shrink-0 items-center gap-3">
                          {n.createdAt ? (
                            <span className="pt-0.5 text-[11px] tabular-nums text-gray-400">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="text-gray-400 hover:text-green-700 disabled:opacity-40"
                            disabled={toggleRead.isPending}
                            onClick={() => toggleRead.mutate(n.id)}
                            aria-label={isUnread ? 'Mark as read' : 'Mark as unread'}
                            title={isUnread ? 'Mark as read' : 'Mark as unread'}
                          >
                            {isUnread ? <EnvelopeOpen size={15} /> : <Envelope size={15} />}
                          </button>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => setToDelete(n)}
                            aria-label="Delete notification"
                            title="Delete"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                      {body ? <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{body}</p> : null}
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 pt-0.5 text-xs font-medium text-green-700 hover:underline"
                          onClick={() => {
                            if (isUnread) toggleRead.mutate(n.id);
                          }}
                        >
                          Open related page
                          <ArrowRight size={12} weight="bold" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="h-8 border border-black/15 bg-white px-3 text-xs hover:bg-gray-50 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs tabular-nums text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="h-8 border border-black/15 bg-white px-3 text-xs hover:bg-gray-50 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete notification?"
        description={toDelete ? `"${notificationTitle(toDelete)}" will be removed from your inbox.` : undefined}
        confirmText="Delete"
        isLoading={deleteOne.isPending}
        onConfirm={() => toDelete && deleteOne.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all notifications?"
        description="This removes every notification from your Potta inbox. This cannot be undone."
        confirmText="Clear all"
        isLoading={clearAll.isPending}
        onConfirm={() => clearAll.mutate(undefined, { onSettled: () => setConfirmClear(false) })}
      />
    </RootLayout>
  );
}
