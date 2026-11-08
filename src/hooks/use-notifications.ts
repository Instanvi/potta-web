'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAuthContextStore } from '@/store/use-auth-context-store';
import { notificationsService, type NotificationsPage } from '@/services/notifications.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (orgId: string | null, locationId: string | null, page: number, limit: number) =>
    ['notifications', 'list', orgId ?? 'none', locationId ?? 'all', page, limit] as const,
};

function apiError(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return typeof message === 'string' && message ? message : fallback;
}

export function useNotifications(page = 1, limit = 20) {
  const { status } = useSession();
  const orgId = useAuthContextStore((s) => s.organizationId);
  const locationId = useAuthContextStore((s) => s.locationId);

  return useQuery<NotificationsPage>({
    queryKey: notificationKeys.list(orgId, locationId, page, limit),
    queryFn: () => notificationsService.list({ page, limit }),
    enabled: status === 'authenticated',
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateInbox() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useToggleNotificationRead() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: (id: string) => notificationsService.toggleRead(id),
    onSuccess: invalidate,
    onError: (e) => toast.error(apiError(e, 'Could not update the notification')),
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      return invalidate();
    },
    onError: (e) => toast.error(apiError(e, 'Could not mark notifications as read')),
  });
}

export function useClearAllNotifications() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: () => {
      toast.success('Notifications cleared');
      return invalidate();
    },
    onError: (e) => toast.error(apiError(e, 'Could not clear notifications')),
  });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateInbox();
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteOne(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      return invalidate();
    },
    onError: (e) => toast.error(apiError(e, 'Could not delete the notification')),
  });
}
