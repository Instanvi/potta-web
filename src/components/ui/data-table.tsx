'use client';

import * as React from 'react';
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table as TanstackTable,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@potta/components/shadcn/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@potta/components/ui/table';
import { DataTablePagination } from '@potta/components/ui/data-table-pagination';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
import { cn } from '@potta/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_PREFIX = 'potta-dt-visibility:';

function loadVisibility(storageKey?: string): VisibilityState {
  if (!storageKey || typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as VisibilityState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveVisibility(storageKey: string | undefined, state: VisibilityState) {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

interface DataTableProps<TData> {
  columns?: ColumnDef<TData>[];
  column?: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  loading?: boolean;
  progressComponent?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  className?: string;
  withRowSelection?: boolean;
  /** Server-side: omit client page slicing; use pageCount + controlled pagination. */
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** Total rows on server (for pagination footer when manualPagination). */
  totalRows?: number;
  /** Called with the selected rows whenever the selection changes. */
  onSelectionChange?: (rows: TData[]) => void;
  /** Extra content rendered to the left of the Columns toggle. */
  toolbar?: React.ReactNode;
  /** Show Columns visibility dropdown. Default true. */
  showViewOptions?: boolean;
  /** Persist column visibility under this key in localStorage. */
  storageKey?: string;
  /**
   * Receives the table instance on mount and whenever column visibility changes, so a parent
   * can render `<DataTableViewOptions />` inside its own toolbar (pair with `showViewOptions={false}`).
   * Prefer `useDataTableHandle()` to wire this up.
   */
  onTableChange?: (table: TanstackTable<TData>) => void;
}

/** Lifts the DataTable instance into the parent so Columns can live in a shared ListToolbar. */
export function useDataTableHandle<TData>() {
  const [handle, setHandle] = React.useState<{ table: TanstackTable<TData> } | null>(null);
  const onTableChange = React.useCallback(
    (table: TanstackTable<TData>) => setHandle({ table }),
    [],
  );
  return { table: handle?.table ?? null, onTableChange };
}

export function DataTable<TData>({
  columns = [],
  column,
  data,
  isLoading,
  loading,
  progressComponent,
  onRowClick,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPagination = true,
  className,
  withRowSelection = true,
  manualPagination = false,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  totalRows: serverTotalRows,
  onSelectionChange,
  toolbar,
  showViewOptions = true,
  storageKey,
  onTableChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => loadVisibility(storageKey));
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize,
    });

  const pagination = controlledPagination ?? internalPagination;
  const onPaginationChange =
    controlledOnPaginationChange ?? setInternalPagination;

  React.useEffect(() => {
    if (!controlledPagination) {
      setInternalPagination((prev) =>
        prev.pageSize === pageSize ? prev : { ...prev, pageSize }
      );
    }
  }, [pageSize, controlledPagination]);

  React.useEffect(() => {
    if (storageKey) {
      setColumnVisibility(loadVisibility(storageKey));
    }
  }, [storageKey]);

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> =
    React.useCallback(
      (updater) => {
        setColumnVisibility((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          saveVisibility(storageKey, next);
          return next;
        });
      },
      [storageKey],
    );

  const resolvedColumns = React.useMemo(() => {
    const baseColumns = column ?? columns;
    if (!withRowSelection) {
      return baseColumns;
    }

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(event) => event.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...baseColumns];
  }, [column, columns, withRowSelection]);

  const table = useReactTable({
    data: data ?? [],
    columns: resolvedColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: pageCount ?? -1,
        }
      : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    enableRowSelection: withRowSelection,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const onSelectionChangeRef = React.useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;
  React.useEffect(() => {
    onSelectionChangeRef.current?.(table.getSelectedRowModel().rows.map((r) => r.original));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, data]);

  const onTableChangeRef = React.useRef(onTableChange);
  onTableChangeRef.current = onTableChange;
  React.useEffect(() => {
    onTableChangeRef.current?.(table);
  }, [table, columnVisibility]);

  const tableLoading = isLoading || loading;
  const showToolbar =
    Boolean(toolbar) ||
    (showViewOptions && table.getAllColumns().some((c) => c.getCanHide()));
  const skeletonRows = Math.min(pageSize || 8, 10);
  const colCount = Math.max(resolvedColumns.length, 1);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
          {toolbar}
          {showViewOptions && <DataTableViewOptions table={table} />}
        </div>
      )}
      <div className="flex flex-col overflow-hidden rounded-[2px] border border-black/[0.08] bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-t-0 border-b border-black/10 bg-table-head hover:bg-table-head"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-11 bg-table-head px-4 text-sm font-normal tracking-normal text-black',
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                    onClick={tableLoading ? undefined : header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {!tableLoading && header.column.getIsSorted() === 'asc' && (
                        <ChevronUp className="size-3.5 text-muted-foreground" />
                      )}
                      {!tableLoading && header.column.getIsSorted() === 'desc' && (
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              progressComponent ? (
                <TableRow>
                  <TableCell colSpan={colCount} className="p-0">
                    {progressComponent}
                  </TableCell>
                </TableRow>
              ) : (
                Array.from({ length: skeletonRows }).map((_, r) => (
                  <TableRow
                    key={`sk-${r}`}
                    className="border-0 border-b border-black/[0.06] last:border-b-0 hover:bg-transparent"
                  >
                    {Array.from({ length: colCount }).map((_, c) => (
                      <TableCell key={c} className="px-4 py-3.5">
                        <div
                          className={cn(
                            'h-3.5 animate-pulse rounded-[2px] bg-gray-200/80',
                            ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/12', 'w-1/3'][(r + c) % 5]
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className={cn(
                    'border-0 border-b border-black/[0.06] transition-colors last:border-b-0 hover:bg-black/[0.02]',
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected() && 'bg-muted hover:bg-muted'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="h-32 text-center text-sm font-normal text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {!tableLoading &&
          showPagination &&
          (manualPagination
            ? (serverTotalRows ?? 0) > 0 || (data?.length ?? 0) > 0
            : table.getFilteredRowModel().rows.length > 0) && (
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
              totalRowsOverride={
                manualPagination ? serverTotalRows : undefined
              }
            />
          )}
      </div>
    </div>
  );
}
