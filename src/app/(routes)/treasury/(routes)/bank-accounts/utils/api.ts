import axios from 'config/axios.config';

export interface BankAccountPayload {
  // Define the structure as needed
  [key: string]: any;
}

export interface BankAccountResponse {
  // Define the structure as needed
  [key: string]: any;
}

export const bankAccountApi = {
  create: async (data: BankAccountPayload) => {
    const result = await axios.post('/bank-accounts', data);
    return result?.data;
  },
  getAll: async (params: Record<string, any> = {}) => {
    const result = await axios.get('/bank-accounts', { params });
    return result?.data;
  },
  update: async (id: string, data: Partial<BankAccountPayload>) => {
    const result = await axios.put(`/bank-accounts/${id}`, data);
    return result?.data;
  },
  getOne: async (id: string) => {
    const result = await axios.get(`/bank-accounts/${id}`);
    return result?.data;
  },
  deactivate: async (id: string) => {
    const result = await axios.post(`/bank-accounts/${id}/deactivate`);
    return result?.data;
  },
  getBalance: async (id: string) => {
    const result = await axios.get(`/bank-accounts/${id}/balance`);
    return result?.data;
  },
};
