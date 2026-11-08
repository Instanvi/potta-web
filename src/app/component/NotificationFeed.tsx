import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@potta/components/card';
import { useNotifications, useToggleNotificationRead } from '@/hooks/use-notifications';
import { notificationBody, notificationHref, notificationTitle } from '@/services/notifications.service';
import { notificationVisual } from '@/lib/notification-visual';

export const NotificationFeed = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotifications(1, 5);
  const toggleRead = useToggleNotificationRead();
  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(21,128,61,0.06)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-stone-100 px-6 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <Bell className="h-5 w-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium text-black">Notifications</CardTitle>
            <p className="text-base font-normal text-black">{unreadCount} unread</p>
          </div>
        </div>
        <Link
          href="/notifications"
          className="rounded-md px-3 py-1.5 text-base font-medium text-black hover:bg-stone-100"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col p-0">
        <div className="divide-y divide-stone-100">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 px-6 py-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-stone-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-1/3 animate-pulse bg-stone-100" />
                  <div className="h-3 w-2/3 animate-pulse bg-stone-100" />
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="px-6 py-10 text-center">
              <p className="text-base text-red-600">Could not load notifications.</p>
              <button type="button" className="mt-2 text-sm text-green-700 hover:underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="px-6 py-10 text-center text-base text-stone-500">You&apos;re all caught up.</p>
          ) : (
            items.map((n) => {
              const { Icon } = notificationVisual(n);
              const href = notificationHref(n);
              const body = notificationBody(n);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.isRead) toggleRead.mutate(n.id);
                    router.push(href || '/notifications');
                  }}
                  className={`flex w-full cursor-pointer items-start space-x-3 px-6 py-4 text-left transition-colors hover:bg-stone-50 ${
                    !n.isRead ? 'bg-green-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <Icon size={20} className="text-black" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between gap-3">
                      <h4 className="text-base font-medium leading-snug text-black">{notificationTitle(n)}</h4>
                      {n.createdAt ? (
                        <span className="shrink-0 text-sm font-normal text-stone-500">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      ) : null}
                    </div>
                    {body ? <p className="line-clamp-2 text-base leading-relaxed text-black">{body}</p> : null}
                  </div>
                  {!n.isRead ? <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" /> : null}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-auto border-t border-stone-100 p-4">
          <Link
            href="/notifications"
            className="group flex w-full items-center justify-center rounded-md border border-stone-200/90 px-4 py-2 text-base font-normal text-black hover:bg-stone-50"
          >
            View All Notifications
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
