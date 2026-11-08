import { ColumnDef } from "@tanstack/react-table";

export type IFilter = {
  limit: number;
  page: number;
  sortOrder: string,
    sortBy: string
};

  export type IColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
    addBorderRight?: boolean; // Custom property
  };

export const INVOICE_PAYMENT_METHODS = [
  'CASH',
  'MOBILE_MONEY',
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'ACH_TRANSAFER',
  'DIGITAL_WALLET',
  'OTHER',
] as const;

export type InvoicePaymentMethod = (typeof INVOICE_PAYMENT_METHODS)[number];

export type RecordInvoicePaymentPayload = {
  paymentMethod: InvoicePaymentMethod;
  amount?: number;
  paymentReference?: string;
};
