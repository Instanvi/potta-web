import { ColumnDef } from "@tanstack/react-table";

export type Filter = {
  limit: number;
  page: number;
  sortOrder?: 'ASC' | 'DESC';
  sortBy?: 'createdAt' | 'updatedAt' | 'code';
  /** Matches the voucher code (server-side). */
  search?: string;
};

  export type IColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
    addBorderRight?: boolean; // Custom property
  };
