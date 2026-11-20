"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  /** When set (e.g. server-side pagination), footer uses this total instead of filtered rows. */
  totalRowsOverride?: number;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 50, 100],
  totalRowsOverride,
}: DataTablePaginationProps<TData>) {
  const totalRows =
    totalRowsOverride ?? table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-muted-foreground">
        <span>Rows</span>
        <div className="inline-flex overflow-hidden rounded-[2px] border border-input bg-background">
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => table.setPageSize(size)}
              className={`h-8 min-w-9 px-2.5 text-sm transition-colors ${
                pageSize === size
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent'
              }`}
              aria-pressed={pageSize === size}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm font-normal text-muted-foreground">
        Showing {start} to {end} of {totalRows} entries
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex size-8 items-center justify-center rounded-[2px] border border-input bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex size-8 items-center justify-center rounded-[2px] border border-input bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="inline-flex size-8 items-center justify-center rounded-[2px] border border-input bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="inline-flex size-8 items-center justify-center rounded-[2px] border border-input bg-background text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
