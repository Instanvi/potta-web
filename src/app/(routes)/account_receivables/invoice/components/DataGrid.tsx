import { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import React from 'react';
import { DataTable } from '@potta/components/ui/data-table';

interface IDataGrid<T> {
  data: T[];
  columns?: ColumnDef<T>[];
  column?: ColumnDef<T>[];
  loading?: boolean;
  isLoading?: boolean;
  progressComponent?: React.ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  withRowSelection?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  /** Server-side pagination (spread `useServerPagination().tableProps(meta)`). */
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalRows?: number;
}

const DataGrid = <T,>({
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showPagination = true,
  ...rest
}: IDataGrid<T>) => (
  <DataTable pageSize={pageSize} pageSizeOptions={pageSizeOptions} showPagination={showPagination} {...rest} />
);

export default DataGrid;
