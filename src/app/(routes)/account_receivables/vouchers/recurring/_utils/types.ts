import { ColumnDef } from "@tanstack/react-table";

export type IFilter = {
  limit: number;
  page: number;
  sortOrder?: 'ASC' | 'DESC';
  sortBy?: 'createdAt' | 'updatedAt';
  /** Exact InvoiceStatus (e.g. 'PAID'); sent in the filter body. */
  status?: string;
};

  export type IColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
    addBorderRight?: boolean; // Custom property
  };
