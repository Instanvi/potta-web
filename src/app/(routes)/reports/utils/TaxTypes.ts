// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Tax Summary Report Types
export interface TaxTransaction {
  taxId: string;
  taxType: string;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  datePaid: string;
  paymentStatus: 'paid' | 'pending';
}

export interface TaxSummaryKPIs {
  totalTaxableAmount: number;
  totalTaxCollected: number;
  totalTaxPaid: number;
  outstandingTaxLiability: number;
  taxTypesCollected: {
    taxType: string;
    count: number;
    amount: number;
  }[];
}

// VAT/GST Report Types
export interface VATTransaction {
  transactionId: string;
  invoiceNumber: string;
  taxType: 'VAT' | 'GST';
  transactionType: 'sale' | 'purchase';
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  transactionDate: string;
  vatPaid: number;
  vatCollected: number;
}

export interface VATSummaryKPIs {
  totalVATCollected: number;
  totalVATPaid: number;
  netVATLiability: number;
  totalTaxableSales: number;
  totalTaxablePurchases: number;
}