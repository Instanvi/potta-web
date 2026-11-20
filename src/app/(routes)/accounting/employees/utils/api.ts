import { payrollClient } from 'config/axios.config';
import { extractBooksRows } from '@/lib/books-api';
import type { CreateEmployeePayload } from './validations';

export type PayrollEmployee = Record<string, unknown> & {
  id?: string;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  job_title?: string;
  jobTitle?: string;
};

export type EmployeeListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const employeeKeys = {
  all: ['payroll-employees'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.all, 'list', params] as const,
};

function normalizeEmployee(row: Record<string, unknown>): PayrollEmployee {
  return {
    ...row,
    first_name: (row.first_name ?? row.firstName ?? row.given_name) as string | undefined,
    last_name: (row.last_name ?? row.lastName ?? row.family_name) as string | undefined,
    job_title: (row.job_title ?? row.jobTitle ?? row.title) as string | undefined,
  };
}

export const employeeApi = {
  list: async (params: EmployeeListParams = {}) => {
    const res = await payrollClient.get('/payroll/employees', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: params.search?.trim() || undefined,
      },
    });
    const data = res.data?.data ?? res.data;
    const list = extractBooksRows(data).length
      ? extractBooksRows(data)
      : extractBooksRows(res.data);
    return list.map(normalizeEmployee);
  },

  create: async (payload: CreateEmployeePayload) => {
    const body = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      firstName: payload.first_name,
      lastName: payload.last_name,
      email: payload.email,
      job_title: payload.job_title || undefined,
      jobTitle: payload.job_title || undefined,
      status: payload.status || 'active',
    };
    const res = await payrollClient.post('/payroll/employees', body);
    return res.data?.data ?? res.data;
  },
};
