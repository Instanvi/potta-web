'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Checks, Envelope, EnvelopeOpen, Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import RootLayout from '../layout';
import Button from '@potta/components/button';
import ConfirmDialog from '@potta/components/shared/ConfirmDialog';
import { DataTable } from '@potta/components/ui/data-table';
import { useServerPagination } from '@/hooks/use-server-pagination';
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
import { EmptyState, ErrorState, ListToolbar, PageContainer, PageHeader, Tabs } from '../_shared/states';

type Filter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<NotificationItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { page, limit, tableProps } = useServerPagination({ pageSize: 20 });

  const { data, isLoading, isFetching, isError, error, refetch } = useNotifications(page, limit);
  const toggleRead = useToggleNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();
  const deleteOne = useDeleteNotification();

  const items = useMemo(() => data?.items ?? [], [data]);
  const unread = items.filter((n) => !n.isRead).length;
  const totalItems = data?.meta?.totalItems ?? items.length;

  // The inbox endpoint has no read/unread filter, so the tabs narrow the loaded page.
  const visible = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.isRead);
    if (filter === 'read') return items.filter((n) => n.isRead);
    return items;
  }, [filter, items]);

  const columns: ColumnDef<NotificationItem>[] = [
    {
      id: 'notification',
      header: 'Notification',
      cell: ({ row: { original: n } }) => {
        const href = notificationHref(n);
        const body = notificationBody(n);
        const { Icon, tone } = notificationVisual(n);
        const isUnread = !n.isRead;
        return (
          <div className="flex items-start gap-3.5">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center', tone)}>
              <Icon size={18} weight="duotone" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className={cn('flex items-center gap-2 text-sm text-foreground', isUnread ? 'font-medium' : 'font-normal')}>
                {isUnread ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> : null}
                <span className="truncate">{notificationTitle(n)}</span>
              </p>
              {body ? <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
              {href ? (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 pt-0.5 text-xs font-medium text-primary hover:underline"
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
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Received',
      cell: ({ row: { original: n } }) =>
        n.createdAt ? (
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
        ) : null,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: { original: n } }) => {
        const isUnread = !n.isRead;
        return (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="text-muted-foreground hover:text-primary disabled:opacity-40"
              disabled={toggleRead.isPending}
              onClick={() => toggleRead.mutate(n.id)}
              aria-label={isUnread ? 'Mark as read' : 'Mark as unread'}
              title={isUnread ? 'Mark as read' : 'Mark as unread'}
            >
              {isUnread ? <EnvelopeOpen size={15} /> : <Envelope size={15} />}
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setToDelete(n)}
              aria-label="Delete notification"
              title="Delete"
            >
              <Trash size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Notifications"
          description={`${unread} unread on this page · ${totalItems} total${isFetching && !isLoading ? ' · refreshing…' : ''}`}
        />
        <ListToolbar
          actions={
            <>
              <Button
                type="button"
                theme="default"
                text="Mark all read"
                icon={<Checks size={16} />}
                disabled={unread === 0 || markAll.isPending}
                onClick={() => markAll.mutate()}
              />
              <Button
                type="button"
                theme="outline"
                text="Clear all"
                icon={<Trash size={16} />}
                disabled={items.length === 0 || clearAll.isPending}
                onClick={() => setConfirmClear(true)}
              />
            </>
          }
        >
          <div className="[&>div]:mb-0">
            <Tabs
              tabs={[
                { id: 'all', label: 'All' },
                { id: 'unread', label: unread > 0 ? `Unread (${unread})` : 'Unread' },
                { id: 'read', label: 'Read' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
        </ListToolbar>

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !isLoading && totalItems === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Approvals, invoices, purchase orders and stock alerts from Potta appear here."
          />
        ) : (
          <DataTable
            columns={columns}
            data={visible}
            isLoading={isLoading}
            withRowSelection={false}
            {...tableProps(data?.meta, items.length)}
          />
        )}
      </PageContainer>

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
