'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Checks, Trash } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@potta/components/shadcn/popover';
import ConfirmDialog from '@potta/components/shared/ConfirmDialog';
import {
  useClearAllNotifications,
  useMarkAllNotificationsRead,
  useNotifications,
  useToggleNotificationRead,
} from '@/hooks/use-notifications';
import { notificationBody, notificationHref, notificationTitle } from '@/services/notifications.service';
import { notificationVisual } from '@/lib/notification-visual';
import { cn } from '@/lib/utils';

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const { data, isLoading, isError, refetch } = useNotifications(1, 10);
  const toggleRead = useToggleNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.isRead).length;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded text-gray-600 hover:bg-gray-50 hover:text-black',
              className,
            )}
            aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          >
            <Bell size={20} weight={open ? 'fill' : 'regular'} />
            {unread > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-[380px] rounded border-black/10 bg-white p-0 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
            <p className="text-sm font-medium text-black">
              Notifications
              {unread > 0 ? <span className="ml-1.5 text-xs font-normal text-gray-500">{unread} unread</span> : null}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-7 items-center gap-1 px-2 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                disabled={unread === 0 || markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                <Checks size={14} />
                Read all
              </button>
              <button
                type="button"
                className="flex h-7 items-center gap-1 px-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                disabled={items.length === 0 || clearAll.isPending}
                onClick={() => {
                  setOpen(false);
                  setConfirmClear(true);
                }}
              >
                <Trash size={14} />
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-black/[0.06] px-4 py-3 last:border-b-0">
                    <div className="h-9 w-9 shrink-0 animate-pulse bg-gray-200" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-3 w-2/3 animate-pulse bg-gray-200" />
                      <div className="h-2.5 w-1/2 animate-pulse bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-red-600">Could not load notifications.</p>
                <button type="button" className="mt-2 text-xs text-green-700 hover:underline" onClick={() => refetch()}>
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center bg-green-50 text-green-700">
                  <Bell size={20} weight="duotone" />
                </span>
                <p className="text-sm text-gray-500">You&apos;re all caught up.</p>
              </div>
            ) : (
              items.map((n) => {
                const href = notificationHref(n);
                const body = notificationBody(n);
                const { Icon, tone } = notificationVisual(n);
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      'relative flex w-full items-start gap-3 border-b border-black/[0.06] px-4 py-3 text-left last:border-b-0 hover:bg-black/[0.02]',
                      !n.isRead && 'bg-green-50/50',
                    )}
                    onClick={() => {
                      if (!n.isRead) toggleRead.mutate(n.id);
                      go(href || '/notifications');
                    }}
                  >
                    {!n.isRead ? <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-green-700" /> : null}
                    <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center', tone)}>
                      <Icon size={18} weight="duotone" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className={cn('block text-sm leading-snug text-black', !n.isRead && 'font-medium')}>
                        {notificationTitle(n)}
                      </span>
                      {body ? <span className="line-clamp-2 block text-xs leading-relaxed text-gray-500">{body}</span> : null}
                      {n.createdAt ? (
                        <span className="block text-[11px] text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-black/[0.06] px-4 py-2.5">
            <button type="button" className="text-xs font-medium text-green-700 hover:underline" onClick={() => go('/notifications')}>
              View all notifications
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all notifications?"
        description="This removes every notification from your Potta inbox. This cannot be undone."
        confirmText="Clear all"
        isLoading={clearAll.isPending}
        onConfirm={() => clearAll.mutate(undefined, { onSettled: () => setConfirmClear(false) })}
      />
    </>
  );
}
