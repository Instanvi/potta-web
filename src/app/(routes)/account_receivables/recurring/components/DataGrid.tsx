import React from 'react';
import { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { IColumnDef } from '../_utils/types';

interface IDataGrid<T> {
  data: T[];
  column: IColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  /** Server-side pagination (spread `useServerPagination().tableProps(meta)`). */
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalRows?: number;
  pageSize?: number;
}

const DataGrid = <T,>({ column, ...rest }: IDataGrid<T>) => (
  <DataTable columns={column} {...rest} />
);

export default DataGrid;
