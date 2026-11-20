import { ColumnDef } from "@tanstack/react-table";

export type IFilter = {
  limit: number;
  page: number;
};

  export type IColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
    addBorderRight?: boolean; // Custom property
  };