'use client';

import { useCallback, useEffect, useState } from 'react';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';

/** Pagination meta as returned by potta-backend (nestjs-paginate) or the few custom list endpoints. */
export type ListMeta =
  | {
      totalItems?: number;
      totalPages?: number;
      total?: number;
      itemsPerPage?: number;
      limit?: number;
    }
  | null
  | undefined;

export function readListMeta(meta: ListMeta, pageSize: number, rowsOnPage = 0) {
  const totalItems = Number(meta?.totalItems ?? meta?.total ?? rowsOnPage) || 0;
  const perPage = Number(meta?.itemsPerPage ?? meta?.limit ?? pageSize) || pageSize;
  const totalPages = Number(meta?.totalPages) || Math.max(1, Math.ceil(totalItems / perPage));
  return { totalItems, totalPages: Math.max(1, totalPages) };
}

export interface ServerTableProps {
  manualPagination: true;
  pageCount: number;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageSize: number;
}

/**
 * Server-side pagination state for DataTable: send `page`/`limit` to the API, put them in the query key,
 * and spread `tableProps(meta)` on the table. Goes back to page 1 whenever `resetOn` changes (search, filters).
 */
export function useServerPagination({ pageSize = 20, resetOn = [] as unknown[] } = {}) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const resetKey = JSON.stringify(resetOn);

  useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [resetKey]);

  const tableProps = useCallback(
    (meta: ListMeta, rowsOnPage = 0): ServerTableProps => {
      const { totalItems, totalPages } = readListMeta(meta, pagination.pageSize, rowsOnPage);
      return {
        manualPagination: true,
        pageCount: totalPages,
        totalRows: totalItems,
        pagination,
        onPaginationChange: setPagination,
        pageSize: pagination.pageSize,
      };
    },
    [pagination]
  );

  return {
    pagination,
    setPagination,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    tableProps,
  };
}
