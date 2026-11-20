import { ColumnDef } from '@tanstack/react-table';
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
}

const DataGrid = <T,>({
  columns,
  column,
  data,
  loading,
  isLoading,
  progressComponent,
  onRowClick,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPagination = true,
}: IDataGrid<T>) => {
  return (
    <DataTable
      columns={columns}
      column={column}
      data={data}
      isLoading={isLoading}
      loading={loading}
      progressComponent={progressComponent}
      onRowClick={onRowClick}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      showPagination={showPagination}
    />
  );
};

export default DataGrid;
