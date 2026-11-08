'use client';

import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import type { PageMeta } from '../utils/api';

const PAGE_SIZES = [25, 50, 100];

export default function Pager({
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
}: {
  meta?: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isFetching?: boolean;
}) {
  if (!meta || meta.total === 0) return null;
  const totalPages = Math.max(1, meta.totalPages);
  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-sm text-black">
        <span>Show</span>
        <select
          value={meta.limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-black/15 bg-white px-2 py-1 text-sm"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-gray-500">
          {start}–{end} of {meta.total}
          {isFetching ? ' · refreshing…' : ''}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center border border-black/15 bg-white hover:bg-gray-50 disabled:opacity-40"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <CaretLeft size={14} />
        </button>
        <span className="text-sm tabular-nums text-black">
          Page {meta.page} of {totalPages}
        </span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center border border-black/15 bg-white hover:bg-gray-50 disabled:opacity-40"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          <CaretRight size={14} />
        </button>
      </div>
    </div>
  );
}
