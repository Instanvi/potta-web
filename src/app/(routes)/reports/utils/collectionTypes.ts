// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Invoice Summary Types
export interface Invoice {
  expenseId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  invoiceStatus: 'paid' | 'unpaid' | 'overdue' | 'partially paid';
  paymentMethod: string;
}

export interface InvoiceSummaryKPIs {
  totalInvoiceAmount: number;
  totalAmountPaid: number;
  totalOutstandingBalance: number;
  numberOfInvoices: number;
  percentagePaidInvoices: number;
}

// Purchase Order Types
export interface PurchaseOrder {
  purchaseOrderId: string;
  vendorName: string;
  poDate: string;
  deliveryDate: string;
  poAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  poStatus: 'fulfilled' | 'partially fulfilled' | 'pending';
  paymentMethod: string;
}

export interface PurchaseOrderKPIs {
  totalPurchaseOrderAmount: number;
  totalAmountPaid: number;
  totalOutstandingAmount: number;
  numberOfPurchaseOrders: number;
  percentageFulfilledPOs: number;
}

// Sales Receipt Types
export interface SalesReceipt {
  receiptId: string;
  customerName: string;
  receiptDate: string;
  transactionAmount: number;
  amountReceived: number;
  paymentMethod: string;
  transactionStatus: 'completed' | 'pending' | 'refunded';
  description: string;
}

export interface SalesReceiptKPIs {
  totalTransactionAmount: number;
  totalAmountReceived: number;
  numberOfTransactions: number;
  averageTransactionValue: number;
  mostUsedPaymentMethod: string;
}