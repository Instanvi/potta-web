'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  booksApi,
  extractBooksRows,
  rowId,
} from '@/lib/books-api';

export const booksResourceKeys = {
  all: ['books-resource'] as const,
  list: (path: string, filter: Record<string, unknown>, params: Record<string, unknown>) =>
    ['books-resource', path, 'list', filter, params] as const,
  detail: (path: string, id: string) =>
    ['books-resource', path, 'detail', id] as const,
};

export function useBooksResourceList(
  resourcePath: string,
  filter: Record<string, unknown>,
  params: Record<string, unknown>,
  enabled = true,
) {
  return useQuery({
    queryKey: booksResourceKeys.list(resourcePath, filter, params),
    queryFn: async () => {
      const raw = await booksApi.list(resourcePath, filter, params);
      return extractBooksRows(raw);
    },
    enabled: Boolean(resourcePath) && enabled,
    placeholderData: (prev) => prev,
  });
}

export function useBooksResourceCreate(resourcePath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => booksApi.create(resourcePath, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: booksResourceKeys.all });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || e?.message || 'Create failed');
    },
  });
}

export function useBooksResourceUpdate(resourcePath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      booksApi.update(resourcePath, id, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: booksResourceKeys.all });
      void qc.invalidateQueries({
        queryKey: booksResourceKeys.detail(resourcePath, vars.id),
      });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || e?.message || 'Update failed');
    },
  });
}

export function useBooksResourceRemove(resourcePath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => booksApi.remove(resourcePath, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: booksResourceKeys.all });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || e?.message || 'Delete failed');
    },
  });
}

export { rowId };
