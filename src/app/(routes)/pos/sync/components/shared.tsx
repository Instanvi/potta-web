'use client';
import { useCallback, useState } from 'react';
import type { PaginationState, Updater } from '@tanstack/react-table';
import type { ServerTableProps } from '@/hooks/use-server-pagination';
import { POS_SYNC_KINDS, PosSyncKind } from '../utils/api';

export const KindFilter = ({
  value,
  onChange,
}: {
  value: PosSyncKind[];
  onChange: (kinds: PosSyncKind[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const toggle = (kind: PosSyncKind) =>
    onChange(value.includes(kind) ? value.filter((k) => k !== kind) : [...value, kind]);

  return (
    <div className="relative">
      <span className="mb-2 block text-sm font-medium text-foreground">Kinds</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 min-w-[200px] items-center justify-between gap-2 rounded-[2px] border border-input bg-background px-3 text-left text-sm"
      >
        {value.length ? `${value.length} selected` : 'All kinds'}
        <i className="ri-arrow-down-s-line text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-64 overflow-y-auto rounded-[2px] border border-input bg-background shadow-md">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent"
            onClick={() => onChange([])}
          >
            Clear selection
          </button>
          {POS_SYNC_KINDS.map((kind) => (
            <label
              key={kind}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={value.includes(kind)}
                onChange={() => toggle(kind)}
                className="accent-primary"
              />
              {kind}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Keyset (cursor) pagination for DataTable's standard pager. The API has no total count, so the
 * footer total is a lower bound: rows seen so far, plus one while the server reports more.
 */
export const useCursorTable = (initialPageSize = 50) => {
  const [stack, setStack] = useState<(string | undefined)[]>([undefined]);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pageIndex = stack.length - 1;
  const reset = useCallback(() => setStack([undefined]), []);

  const tableProps = (
    page: { nextCursor?: string | null; hasMore?: boolean } | undefined,
    rowsOnPage: number
  ): ServerTableProps => {
    const nextCursor = page?.hasMore ? page.nextCursor : null;
    const pagination: PaginationState = { pageIndex, pageSize };
    return {
      manualPagination: true,
      pageCount: nextCursor ? pageIndex + 2 : pageIndex + 1,
      totalRows: pageIndex * pageSize + rowsOnPage + (nextCursor ? 1 : 0),
      pagination,
      pageSize,
      onPaginationChange: (updater: Updater<PaginationState>) => {
        const next = typeof updater === 'function' ? updater(pagination) : updater;
        if (next.pageSize !== pageSize) {
          setPageSize(next.pageSize);
          reset();
        } else if (next.pageIndex === 0) {
          reset();
        } else if (next.pageIndex > pageIndex && nextCursor) {
          setStack((s) => [...s, nextCursor]);
        } else if (next.pageIndex < pageIndex) {
          setStack((s) => s.slice(0, next.pageIndex + 1));
        }
      },
    };
  };

  return { cursor: stack[pageIndex], limit: pageSize, pageIndex, reset, tableProps };
};

export const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-xs break-all">{children}</span>
);
