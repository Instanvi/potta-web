import axios from 'config/axios.config';

export interface PayImportIssue {
  payProductId: string;
  name?: string;
  reason: string;
}

/** potta-backend POST /Item/import-from-payments (payment-service owns products). */
export interface PayImportResult {
  payLocationId: string;
  received: number;
  created: number;
  updated: number;
  linked: number;
  disabled: number;
  skipped: PayImportIssue[];
  warnings: PayImportIssue[];
}

export const payImportApi = {
  importFromPay: async (targetLocationId?: string): Promise<PayImportResult> => {
    const res = await axios.post('/Item/import-from-payments', targetLocationId ? { targetLocationId } : {});
    return res.data;
  },
};
