import axios from 'config/axios.config';
import {
  Reimbursement,
  CreateReimbursementRequest,
  ApproveReimbursementRequest,
  PayReimbursementRequest,
  ReimbursementResponse,
  Employee,
} from './api-types';

// Reimbursement API functions
export const reimbursementsApi = {
  // GET /api/reimbursements - Get all reimbursements
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    employeeId?: string;
    search?: string;
  }): Promise<ReimbursementResponse> => {
    const response = await axios.get('/reimbursements', { params });
    return response.data;
  },

  // GET /api/reimbursements/{uuid} - Get reimbursement by UUID
  getById: async (uuid: string): Promise<Reimbursement> => {
    const response = await axios.get(`/reimbursements/${uuid}`);
    return response.data;
  },

  // POST /api/reimbursements - Submit a new reimbursement request
  create: async (data: CreateReimbursementRequest): Promise<Reimbursement> => {
    const response = await axios.post('/reimbursements', data);
    return response.data;
  },

  // PATCH /api/reimbursements/approve - Approve a reimbursement request
  approve: async (
    data: ApproveReimbursementRequest
  ): Promise<Reimbursement> => {
    const response = await axios.patch('/reimbursements/approve', data);
    return response.data;
  },

  // PATCH /api/reimbursements/pay - Mark a reimbursement as paid
  pay: async (data: PayReimbursementRequest): Promise<Reimbursement> => {
    const response = await axios.patch('/reimbursements/pay', data);
    return response.data;
  },

  // PATCH /api/reimbursements/{uuid} - Update a reimbursement (if supported)
  update: async (
    uuid: string,
    data: Partial<CreateReimbursementRequest>
  ): Promise<Reimbursement> => {
    const response = await axios.patch(`/reimbursements/${uuid}`, data);
    return response.data;
  },

  // DELETE /api/reimbursements/{uuid} - Delete a reimbursement (if supported)
  delete: async (uuid: string): Promise<void> => {
    await axios.delete(`/reimbursements/${uuid}`);
  },
};

// Employee API functions (assuming this exists or needs to be created)
export const employeesApi = {
  // Get all employees for dropdowns
  getAll: async (params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    sortBy?: string[];
  }): Promise<{ data: Employee[] }> => {
    const filterParams = {
      limit: params?.limit || 100,
      sortBy: params?.sortBy || ['firstName:ASC'],
      ...(params?.page && { page: params.page }),
      ...(params?.searchTerm && { searchTerm: params.searchTerm }),
    };

    const response = await axios.post('/employees/filter', filterParams);
    return response.data;
  },

  // Get employee by ID
  getById: async (uuid: string): Promise<Employee> => {
    const response = await axios.get(`/employees/${uuid}`);
    return response.data;
  },
};

export default reimbursementsApi;
