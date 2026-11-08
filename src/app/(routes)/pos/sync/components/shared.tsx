'use client';
import { useState } from 'react';
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
      <span className="mb-1 block text-sm font-medium text-gray-900">Kinds</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-w-[200px] border border-gray-200 bg-white px-3 py-2.5 text-left text-sm"
      >
        {value.length ? `${value.length} selected` : 'All kinds'}
        <i className="ri-arrow-down-s-line float-right" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-64 overflow-y-auto border border-gray-200 bg-white shadow-md">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-green-700 hover:bg-gray-50"
            onClick={() => onChange([])}
          >
            Clear selection
          </button>
          {POS_SYNC_KINDS.map((kind) => (
            <label
              key={kind}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={value.includes(kind)}
                onChange={() => toggle(kind)}
                className="accent-green-700"
              />
              {kind}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/** Keyset pager: keeps the stack of cursors seen so far so "Previous" can step back. */
export const useCursorPager = () => {
  const [stack, setStack] = useState<(string | undefined)[]>([undefined]);
  const cursor = stack[stack.length - 1];
  return {
    cursor,
    page: stack.length,
    next: (nextCursor?: string | null) =>
      nextCursor && setStack((s) => [...s, nextCursor]),
    prev: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    reset: () => setStack([undefined]),
  };
};

export const CursorPager = ({
  page,
  hasMore,
  onPrev,
  onNext,
  isFetching,
}: {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
  isFetching?: boolean;
}) => (
  <div className="mt-3 flex items-center justify-end gap-3 text-sm">
    {isFetching && <span className="text-gray-500">Loading...</span>}
    <span className="text-gray-500">Page {page}</span>
    <button
      type="button"
      disabled={page <= 1}
      onClick={onPrev}
      className="border border-gray-300 px-3 py-1.5 disabled:opacity-40"
    >
      Previous
    </button>
    <button
      type="button"
      disabled={!hasMore}
      onClick={onNext}
      className="border border-gray-300 px-3 py-1.5 disabled:opacity-40"
    >
      Next
    </button>
  </div>
);

export const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-xs break-all">{children}</span>
);
