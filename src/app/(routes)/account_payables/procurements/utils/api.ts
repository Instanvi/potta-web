import axios from 'config/axios.config';
import type {
  SpendRequest,
  SpendRequestFilter,
  RFQ,
  RFQFilter,
  ApprovalAction,
  RejectionAction,
  SendRFQPayload,
  CloseRFQPayload,
} from './types';

const BASE_PATH = '/procurement';

// Spend Requests API
export const spendRequestsApi = {
  // Get all spend requests
  getAll: async (filter?: SpendRequestFilter): Promise<SpendRequest[]> => {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.priority) params.append('priority', filter.priority);

    const response = await axios.get(
      `${BASE_PATH}/spend-requests${
        params.toString() ? `?${params.toString()}` : ''
      }`
    );
    return response.data;
  },

  // Get spend request by ID
  getById: async (id: string): Promise<SpendRequest> => {
    const response = await axios.get(`${BASE_PATH}/spend-requests/${id}`);
    return response.data;
  },

  // Create new spend request
  create: async (data: Partial<SpendRequest>): Promise<SpendRequest> => {
    const response = await axios.post(`${BASE_PATH}/spend-requests`, data);
    return response.data;
  },

  // Update spend request
  update: async (
    id: string,
    data: Partial<SpendRequest>
  ): Promise<SpendRequest> => {
    const response = await axios.put(`${BASE_PATH}/spend-requests/${id}`, data);
    return response.data;
  },

  // Submit spend request for approval
  submit: async (id: string): Promise<SpendRequest> => {
    const response = await axios.post(
      `${BASE_PATH}/spend-requests/${id}/submit`
    );
    return response.data;
  },

  // Approve spend request
  approve: async (id: string, data?: ApprovalAction): Promise<SpendRequest> => {
    const response = await axios.post(
      `${BASE_PATH}/spend-requests/${id}/approve`,
      data
    );
    return response.data;
  },

  // Reject spend request
  reject: async (id: string, data: RejectionAction): Promise<SpendRequest> => {
    const response = await axios.post(
      `${BASE_PATH}/spend-requests/${id}/reject`,
      data
    );
    return response.data;
  },

  // Get approval history
  getApprovalHistory: async (id: string): Promise<any> => {
    const response = await axios.get(
      `${BASE_PATH}/spend-requests/${id}/approval-history`
    );
    return response.data;
  },
};

// RFQs API
export const rfqsApi = {
  // Get all RFQs
  getAll: async (filter?: RFQFilter): Promise<RFQ[]> => {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);

    const response = await axios.get(
      `${BASE_PATH}/rfqs${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get RFQ by ID
  getById: async (id: string): Promise<RFQ> => {
    const response = await axios.get(`${BASE_PATH}/rfqs/${id}`);
    return response.data;
  },

  // Create RFQ for spend request
  create: async (spendRequestId: string, data: Partial<RFQ>): Promise<RFQ> => {
    const response = await axios.post(
      `${BASE_PATH}/spend-requests/${spendRequestId}/rfq`,
      data
    );
    return response.data;
  },

  // Update RFQ
  update: async (id: string, data: Partial<RFQ>): Promise<RFQ> => {
    const response = await axios.put(`${BASE_PATH}/rfqs/${id}`, data);
    return response.data;
  },

  // Send RFQ to vendors
  send: async (id: string, data: SendRFQPayload): Promise<RFQ> => {
    const response = await axios.post(`${BASE_PATH}/rfqs/${id}/send`, data);
    return response.data;
  },

  // Close RFQ
  close: async (id: string, data: CloseRFQPayload): Promise<RFQ> => {
    const response = await axios.post(`${BASE_PATH}/rfqs/${id}/close`, data);
    return response.data;
  },
};

// Approvals API
export const approvalsApi = {
  // Get pending approvals for current user
  getPending: async (): Promise<SpendRequest[]> => {
    const response = await axios.get(`${BASE_PATH}/approvals/pending`);
    return response.data;
  },
};

// Dashboard & Analytics API
export const procurementAnalyticsApi = {
  // Get dashboard data
  getDashboard: async (): Promise<any> => {
    const response = await axios.get(`${BASE_PATH}/dashboard`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${BASE_PATH}/analytics${
        params.toString() ? `?${params.toString()}` : ''
      }`
    );
    return response.data;
  },
};
