import axios from 'config/axios.config';

export const payslipsApi = {
  create: async (data: any) => {
    const result = await axios.post('/payslips', data);
    return result.data;
  },
  filter: async (filter: any) => {
    const result = await axios.post('/payslips/filter', filter);
    return result.data;
  },
  getById: async (id: string) => {
    const result = await axios.get(`/payslips/${id}`);
    return result.data;
  },
  getByEmployee: async (employeeId: string, params: any) => {
    const result = await axios.get(`/payslips/employee/${employeeId}`, {
      params,
    });
    return result.data;
  },
  markAsPaid: async (id: string) => {
    const result = await axios.put(`/payslips/${id}/mark-as-paid`);
    return result.data;
  },
  export: async (id: string) => {
    const result = await axios.get(`/payslips/${id}/export`, {
      responseType: 'blob',
    });
    return result.data;
  },
};
