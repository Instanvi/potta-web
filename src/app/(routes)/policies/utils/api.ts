import axios from 'config/axios.config';

export const PoliciesApi = {
  getAll: async (filter: any) => {
    const data = {};
    const result = await axios.get('/policies/all', {
      params: { ...filter },
    });
    console.log('result', result.data.data);
    return result?.data;
  },
  getOne: async (policies_id: string) => {
    const result = await axios.get(`/policies/details/${policies_id}`);
    return result?.data;
  },

  update: async (policies_id: string, data: unknown) => {
    const result = await axios.put(`/policies/${policies_id}`, data);
    return result?.data;
  },
  delete: async (policyId: string) => {
    const result = await axios.delete(`/policies/${policyId}`);
    return result?.data;
  },

  SearchAllEmployees: async (employeeName: string): Promise<unknown> => {
    const result = await axios.get(`/employees/search/?name=${employeeName}`);
    return result?.data;
  },
};
