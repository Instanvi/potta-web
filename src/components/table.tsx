'use client';

import { FC, ReactNode, useMemo } from 'react';
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import CustomLoader from './loader';

interface ColumnWithBorder {
  name: string | ReactNode;
  selector?: (row: any) => any;
  sortable?: boolean;
  cell?: (row: any, index?: number, column?: any) => ReactNode;
  width?: string;
  [key: string]: any;
}

interface TableProps {
  columns: ColumnWithBorder[];
  data: any[];
  pagination?: boolean;
  selectable?: boolean;
  pending?: boolean;
  onRowClicked?: (row: any) => void;
  paginationServer?: boolean;
  paginationTotalRows?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rows: number) => void;
  /** 1-based page index when using server pagination */
  currentPage?: number;
  rowsPerPage?: number;
}

const MyTable: FC<TableProps> = ({
  columns,
  data,
  pagination,
  selectable = true,
  pending,
  onRowClicked,
  paginationServer,
  paginationTotalRows = 0,
  onChangePage,
  onChangeRowsPerPage,
  currentPage = 1,
  rowsPerPage = 10,
}) => {
  const tanstackColumns = useMemo<ColumnDef<any>[]>(
    () =>
      (columns || []).map((column, index) => ({
        id: column.id || `col-${index}`,
        header: column.name,
        accessorFn: (row) => (column.selector ? column.selector(row) : undefined),
        cell: ({ row }) =>
          column.cell
            ? column.cell(row.original, row.index, column)
            : column.selector
            ? column.selector(row.original)
            : null,
        enableSorting: !!column.sortable,
      })),
    [columns]
  );

  const manualPagination = !!paginationServer;
  const pageSize = rowsPerPage;
  const pageCount = Math.max(
    1,
    Math.ceil((paginationTotalRows || 0) / pageSize) || 1
  );

  const paginationState: PaginationState = {
    pageIndex: Math.max(0, currentPage - 1),
    pageSize,
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(paginationState) : updater;
    if (next.pageIndex !== paginationState.pageIndex) {
      onChangePage?.(next.pageIndex + 1);
    }
    if (next.pageSize !== paginationState.pageSize) {
      onChangeRowsPerPage?.(next.pageSize);
    }
  };

  return (
    <DataTable
      columns={tanstackColumns}
      data={data || []}
      isLoading={pending}
      progressComponent={<CustomLoader />}
      onRowClick={onRowClicked}
      showPagination={pagination !== false}
      withRowSelection={selectable}
      pageSize={pageSize}
      manualPagination={manualPagination}
      pageCount={manualPagination ? pageCount : undefined}
      pagination={manualPagination ? paginationState : undefined}
      onPaginationChange={manualPagination ? onPaginationChange : undefined}
      totalRows={manualPagination ? paginationTotalRows : undefined}
    />
  );
};

export default MyTable;
