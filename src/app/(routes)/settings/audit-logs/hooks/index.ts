import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  auditApi,
  notificationLogsApi,
  type AuditLogQuery,
  type NotificationLogQuery,
} from '../utils/api';

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (query: AuditLogQuery) => ['audit-logs', 'list', query] as const,
  history: (entityType: string, entityId: string) => ['audit-logs', 'history', entityType, entityId] as const,
};

export const notificationLogKeys = {
  all: ['notification-logs'] as const,
  list: (query: NotificationLogQuery) => ['notification-logs', 'list', query] as const,
};

export function useAuditLogs(query: AuditLogQuery, enabled = true) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => auditApi.list(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRecordHistory(entityType: string, entityId: string, enabled = true) {
  return useQuery({
    queryKey: auditKeys.history(entityType, entityId),
    queryFn: () => auditApi.history(entityType, entityId, { limit: 100 }),
    enabled: enabled && Boolean(entityType && entityId),
  });
}

export function useNotificationLogs(query: NotificationLogQuery, enabled = true) {
  return useQuery({
    queryKey: notificationLogKeys.list(query),
    queryFn: () => notificationLogsApi.list(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}
