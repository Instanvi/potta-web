'use client';

import * as React from 'react';
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
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
import { cn } from '@potta/lib/utils';

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
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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
    onColumnVisibilityChange: setColumnVisibility,
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

  const tableLoading = isLoading || loading;

  if (tableLoading) {
    return (
      <div className="mt-5">
        {progressComponent || (
          <div className="animate-pulse">
            <div className="h-[40px] w-full border-b border-black/10 bg-[#ecf8f4]" />
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4 p-4">
                  {resolvedColumns.map((_, colIndex) => (
                    <div key={colIndex} className="h-4 w-full bg-black/10" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden border border-black/10 bg-white',
        className
      )}
    >
      <Table>
        <TableHeader className="bg-[#ecf8f4] [&_tr]:border-b [&_tr]:border-black/10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-0 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'bg-[#ecf8f4] text-black',
                    header.column.getCanSort() && 'cursor-pointer select-none'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: '🔼',
                      desc: '🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  row.getIsSelected() && 'bg-[#154406]/8'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={resolvedColumns.length || 1}
                className="h-24 text-center text-sm font-normal text-black"
              >
                No data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {showPagination &&
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
  );
}
