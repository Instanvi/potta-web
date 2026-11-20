import axios from 'config/axios.config';

export interface Bill {
  uuid: string;
  invoiceId?: string;
  invoiceNumber?: string;
  vendorInvoiceNumber?: string;
  vendor?: {
    name: string;
  };
  customer?: {
    name: string;
  };
  invoiceType?: string;
  invoiceTotal: number;
  currency: string;
  paymentMethod?: string;
  status: string;
  issuedDate?: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillsResponse {
  data: Bill[];
  meta?: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

export interface BillsFilter {
  status?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string[];
}

export interface PayBillRequest {
  paymentProvider: string;
  currency: string;
  description: string;
}

export interface PayBillResponse {
  success: boolean;
  transactionId: string;
  billStatus: string;
  message: string;
  paymentDate: string;
}

// API functions for bills
export const billsApi = {
  // Get all bills with optional filtering
  getAll: async (filter?: BillsFilter): Promise<BillsResponse> => {
    const params = {
      ...(filter?.status && { status: filter.status }),
      ...(filter?.page && { page: filter.page }),
      ...(filter?.limit && { limit: filter.limit }),
      ...(filter?.searchTerm && { searchTerm: filter.searchTerm }),
      ...(filter?.sortBy && { sortBy: filter.sortBy }),
    };

    const response = await axios.get('/bills', { params });
    return response.data;
  },

  // Get bill by ID
  getById: async (uuid: string): Promise<Bill> => {
    const response = await axios.get(`/bills/${uuid}`);
    return response.data;
  },

  // Approve bill
  approve: async (uuid: string): Promise<Bill> => {
    const response = await axios.put(`/bills/${uuid}/approve`);
    return response.data;
  },

  // Reject bill
  reject: async (uuid: string): Promise<Bill> => {
    const response = await axios.put(`/bills/${uuid}/reject`);
    return response.data;
  },

  // Pay bill
  pay: async (
    uuid: string,
    paymentData: PayBillRequest
  ): Promise<PayBillResponse> => {
    const response = await axios.put(`/bills/${uuid}/pay`, paymentData);
    return response.data;
  },
};

export default billsApi;
